import { AirQualityResponse, GeocodingResult, OpenMeteoAirQualityRaw, OpenMeteoCurrent, OpenMeteoHourly } from '@/types/api';
import { AqiCategory, CpcbCalculationResult, DailyAqiSummary, HourlyAqiPoint, OutdoorWindow, PollutantDetail, PollutantType } from '@/types/aqi';
import { calculateCpcbAqi, getAqiCategory } from '@/lib/aqi/cpcb-calculator';
import { POLLUTANTS_METADATA } from '@/lib/aqi/pollutants';

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T, ttlMs: number): void {
  // Prune expired or limit cache size
  if (memoryCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expiresAt) memoryCache.delete(k);
    }
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const OPEN_METEO_AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Searches locations using Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string, count = 8): Promise<GeocodingResult[]> {
  const cacheKey = `geo:${query.toLowerCase()}:${count}`;
  const cached = getFromCache<GeocodingResult[]>(cacheKey);
  if (cached) return cached;

  const url = `${OPEN_METEO_GEO_URL}?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Geocoding API responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const results: GeocodingResult[] = data.results || [];

    setInCache(cacheKey, results, 3600 * 1000); // 1 hour cache
    return results;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches and models live atmospheric chemistry data from Open-Meteo Air Quality API.
 */
export async function fetchAirQualityData(params: {
  latitude: number;
  longitude: number;
  locationName: string;
  admin1?: string;
  country?: string;
}): Promise<AirQualityResponse> {
  const { latitude, longitude, locationName, admin1 = '', country = '' } = params;
  const roundedLat = Number(latitude.toFixed(4));
  const roundedLon = Number(longitude.toFixed(4));
  const cacheKey = `aq:${roundedLat}:${roundedLon}`;

  const cached = getFromCache<AirQualityResponse>(cacheKey);
  if (cached) return cached;

  const queryParams = new URLSearchParams({
    latitude: roundedLat.toString(),
    longitude: roundedLon.toString(),
    current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi',
    hourly: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi',
    forecast_days: '5',
    timezone: 'auto',
  });

  const url = `${OPEN_METEO_AQ_URL}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 600 }, // 10 minutes Next.js revalidation
    });

    if (!res.ok) {
      throw new Error(`Air Quality API error: HTTP ${res.status}`);
    }

    const rawData: OpenMeteoAirQualityRaw = await res.json();
    const transformed = processAirQualityPayload(rawData, {
      name: locationName,
      admin1,
      country,
      latitude: roundedLat,
      longitude: roundedLon,
    });

    setInCache(cacheKey, transformed, 10 * 60 * 1000); // 10 minutes cache
    return transformed;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Formats ISO strings into friendly readable dates and times.
 */
function formatTimeHour(timeStr: string): string {
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return timeStr;
  }
}

function formatDateString(timeStr: string): { formatted: string; dayName: string } {
  try {
    const d = new Date(timeStr);
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    const formatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { formatted, dayName };
  } catch {
    return { formatted: timeStr, dayName: '' };
  }
}

const POLLUTANT_KEYS: PollutantType[] = [
  'pm2_5',
  'pm10',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
  'ozone',
];

const CATEGORY_STATUS_TEXT: Record<AqiCategory, string> = {
  Good: 'Clean & Favorable',
  Satisfactory: 'Acceptable',
  'Moderately Polluted': 'Elevated',
  Poor: 'Unhealthy',
  'Very Poor': 'Hazardous',
  Severe: 'Emergency',
};

function buildPollutantDetails(
  current: OpenMeteoCurrent | undefined,
  cpcbResult: CpcbCalculationResult
): PollutantDetail[] {
  return POLLUTANT_KEYS.map((pKey) => {
    const meta = POLLUTANTS_METADATA[pKey];
    const rawConc = current?.[pKey] ?? 0;
    const displayConc =
      pKey === 'carbon_monoxide'
        ? Number((rawConc / 1000).toFixed(2))
        : Number(rawConc.toFixed(1));

    const subIndex = cpcbResult.subIndices[pKey];
    const category = subIndex !== null ? getAqiCategory(subIndex) : null;
    const statusText = category ? CATEGORY_STATUS_TEXT[category] : 'Normal';

    return {
      id: pKey,
      name: meta.name,
      chemicalFormula: meta.chemicalFormula,
      unit: meta.unit,
      rawConcentration: rawConc,
      displayConcentration: displayConc,
      averagingHours: meta.averagingHours,
      subIndex,
      category,
      statusText,
      sources: meta.sources,
      healthEffects: meta.healthEffects,
      citizenPrecaution: meta.citizenAction,
      cpcbStandard24hOr8h: meta.cpcbStandard,
    };
  });
}

function buildHourlyForecast(hourlyRaw: OpenMeteoHourly | undefined, nowMs: number): HourlyAqiPoint[] {
  const hourlyPoints: HourlyAqiPoint[] = [];
  if (!hourlyRaw?.time?.length) return hourlyPoints;

  for (let i = 0; i < hourlyRaw.time.length; i++) {
    const timeStr = hourlyRaw.time[i];
    const pointTimeMs = new Date(timeStr).getTime();

    // Skip records older than 2 hours to keep the chart focused on current + upcoming
    if (pointTimeMs < nowMs - 2 * 3600 * 1000) {
      continue;
    }

    const pm25 = hourlyRaw.pm2_5?.[i] ?? 0;
    const pm10 = hourlyRaw.pm10?.[i] ?? 0;
    const coUg = hourlyRaw.carbon_monoxide?.[i] ?? null;

    const calc = calculateCpcbAqi(
      {
        pm2_5: pm25,
        pm10: pm10,
        nitrogen_dioxide: hourlyRaw.nitrogen_dioxide?.[i] ?? null,
        sulphur_dioxide: hourlyRaw.sulphur_dioxide?.[i] ?? null,
        carbon_monoxide: coUg !== null ? coUg / 1000 : null,
        ozone: hourlyRaw.ozone?.[i] ?? null,
      },
      { isCoInMg: true, isModelForecast: true }
    );

    hourlyPoints.push({
      time: timeStr,
      formattedTime: formatTimeHour(timeStr),
      aqi: calc.aqi,
      category: calc.category,
      pm2_5: Number(pm25.toFixed(1)),
      pm10: Number(pm10.toFixed(1)),
      dominantPollutant: calc.dominantPollutant,
      isForecast: pointTimeMs > nowMs,
    });

    // Limit to 48 hours for snappy rendering
    if (hourlyPoints.length >= 48) break;
  }

  return hourlyPoints;
}

const DAILY_RECOMMENDATIONS: Record<AqiCategory, string> = {
  Good: 'Safe for outdoor plans.',
  Satisfactory: 'Safe for outdoor plans.',
  'Moderately Polluted': 'Caution for sensitive groups.',
  Poor: 'Reduce prolonged outdoor exertion.',
  'Very Poor': 'Wear N95 masks; avoid outdoor sports.',
  Severe: 'Stay indoors; emergency pollution.',
};

function buildDailySummaries(hourlyPoints: HourlyAqiPoint[]): DailyAqiSummary[] {
  const daysGroup: Record<string, HourlyAqiPoint[]> = {};
  for (const pt of hourlyPoints) {
    const dayKey = pt.time.split('T')[0];
    if (!daysGroup[dayKey]) daysGroup[dayKey] = [];
    daysGroup[dayKey].push(pt);
  }

  const dailySummaries: DailyAqiSummary[] = [];
  for (const [dateStr, pts] of Object.entries(daysGroup)) {
    if (pts.length === 0) continue;
    const aqiValues = pts.map((p) => p.aqi);
    const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
    const category = getAqiCategory(avgAqi);
    const { formatted, dayName } = formatDateString(dateStr);

    dailySummaries.push({
      date: dateStr,
      formattedDate: formatted,
      dayName,
      minAqi: Math.min(...aqiValues),
      maxAqi: Math.max(...aqiValues),
      avgAqi,
      category,
      dominantPollutant: pts[0]?.dominantPollutant?.replace('_', ' ').toUpperCase() || 'PM2.5',
      recommendation: DAILY_RECOMMENDATIONS[category],
    });
  }

  return dailySummaries;
}

function buildOutdoorWindows(hourlyPoints: HourlyAqiPoint[]): OutdoorWindow[] {
  const bestWindows: OutdoorWindow[] = [];
  const windowSlice = hourlyPoints.slice(0, 18);

  for (let i = 0; i <= windowSlice.length - 3; i += 3) {
    const chunk = windowSlice.slice(i, i + 3);
    if (chunk.length < 3) continue;

    const avg = Math.round(chunk.reduce((sum, p) => sum + p.aqi, 0) / 3);
    const cat = getAqiCategory(avg);

    let suitability: OutdoorWindow['suitability'] = 'Avoid';
    let reason = 'Hazardous smog concentration; avoid outdoor exposure.';
    let recommendedActivities = ['Indoor Workouts Only'];

    if (avg <= 50) {
      suitability = 'Ideal';
      reason = 'Cleanest period for cardiovascular exercise and sports.';
      recommendedActivities = ['Running', 'Cycling', 'Outdoor Sports', 'Walking'];
    } else if (avg <= 100) {
      suitability = 'Ideal';
      reason = 'Air quality is favorable with minor health impact.';
      recommendedActivities = ['Running', 'Cycling', 'Outdoor Sports', 'Walking'];
    } else if (avg <= 200) {
      suitability = 'Acceptable';
      reason = 'Fine for healthy adults; sensitive groups should avoid heavy exertion.';
      recommendedActivities = ['Brisk Walking', 'Commuting', 'Light Chores'];
    } else if (avg <= 300) {
      suitability = 'Caution';
      reason = 'High particulate matter; consider moving workouts indoors.';
      recommendedActivities = ['Essential Transit', 'Short Walks with Mask'];
    }

    bestWindows.push({
      startTime: chunk[0].time,
      endTime: chunk[2].time,
      formattedTimeRange: `${chunk[0].formattedTime} - ${chunk[2].formattedTime}`,
      avgAqi: avg,
      category: cat,
      suitability,
      recommendedActivities,
      reason,
    });
  }

  return bestWindows;
}

function findPeakPollution(
  hourlyPoints: HourlyAqiPoint[]
): AirQualityResponse['forecast']['peakPollution'] {
  if (hourlyPoints.length === 0) return null;
  const peak = hourlyPoints.reduce((max, pt) => (pt.aqi > max.aqi ? pt : max), hourlyPoints[0]);
  return {
    time: peak.time,
    formattedTime: peak.formattedTime,
    aqi: peak.aqi,
    category: peak.category,
    pollutant: peak.dominantPollutant?.replace('_', ' ').toUpperCase() || 'PM2.5',
  };
}

/**
 * Normalizes Open-Meteo data into our complete CPCB-calculated domain model.
 */
export function processAirQualityPayload(
  raw: OpenMeteoAirQualityRaw,
  location: { name: string; admin1?: string; country: string; latitude: number; longitude: number }
): AirQualityResponse {
  const current = raw.current;
  const currentTimestamp = current?.time ? new Date(current.time).toISOString() : new Date().toISOString();

  const rawCoUg = current?.carbon_monoxide ?? null;
  const cpcbResult = calculateCpcbAqi(
    {
      pm2_5: current?.pm2_5 ?? null,
      pm10: current?.pm10 ?? null,
      nitrogen_dioxide: current?.nitrogen_dioxide ?? null,
      sulphur_dioxide: current?.sulphur_dioxide ?? null,
      carbon_monoxide: rawCoUg !== null ? rawCoUg / 1000 : null,
      ozone: current?.ozone ?? null,
    },
    { isCoInMg: true, isModelForecast: true }
  );

  const pollutants = buildPollutantDetails(current, cpcbResult);
  const hourlyPoints = buildHourlyForecast(raw.hourly, Date.now());
  const dailySummaries = buildDailySummaries(hourlyPoints);
  const bestWindows = buildOutdoorWindows(hourlyPoints);
  const peakPollution = findPeakPollution(hourlyPoints);

  const totalMonitored = pollutants.filter((p) => p.subIndex !== null).length;
  const coveragePercent = Math.round((totalMonitored / POLLUTANT_KEYS.length) * 100);

  return {
    location: {
      name: location.name,
      admin1: location.admin1,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: raw.timezone || 'auto',
    },
    current: {
      timestamp: currentTimestamp,
      formattedTimestamp: new Date(currentTimestamp).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      cpcb: cpcbResult,
      pollutants,
      usAqi: current?.us_aqi ?? null,
      europeanAqi: current?.european_aqi ?? null,
    },
    forecast: {
      hourly: hourlyPoints,
      daily: dailySummaries,
      bestWindows,
      peakPollution,
    },
    metadata: {
      dataSource: 'Open-Meteo Atmospheric Chemistry & Numerical Dispersion Simulation',
      modelType: 'Copernicus Atmosphere Monitoring Service (CAMS) & Global Dispersion Models',
      attribution: 'Air quality data provided via Open-Meteo (Non-commercial open data license).',
      dataCoveragePercent: coveragePercent,
      retrievedAt: new Date().toISOString(),
    },
  };
}
