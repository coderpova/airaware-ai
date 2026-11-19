import { AirQualityResponse, GeocodingResult, OpenMeteoAirQualityRaw } from '@/types/api';
import { DailyAqiSummary, HourlyAqiPoint, OutdoorWindow, PollutantDetail, PollutantType } from '@/types/aqi';
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

/**
 * Normalizes Open-Meteo data into our complete CPCB-calculated domain model.
 */
export function processAirQualityPayload(
  raw: OpenMeteoAirQualityRaw,
  location: { name: string; admin1?: string; country: string; latitude: number; longitude: number }
): AirQualityResponse {
  const current = raw.current;
  const currentTimestamp = current?.time ? new Date(current.time).toISOString() : new Date().toISOString();

  // 1. Process Current CPCB calculations
  const rawCoUg = current?.carbon_monoxide ?? null;
  const rawCoMg = rawCoUg !== null ? rawCoUg / 1000 : null;

  const cpcbResult = calculateCpcbAqi(
    {
      pm2_5: current?.pm2_5 ?? null,
      pm10: current?.pm10 ?? null,
      nitrogen_dioxide: current?.nitrogen_dioxide ?? null,
      sulphur_dioxide: current?.sulphur_dioxide ?? null,
      carbon_monoxide: rawCoMg,
      ozone: current?.ozone ?? null,
    },
    { isCoInMg: true, isModelForecast: true }
  );

  // 2. Build detailed Pollutant Detail items
  const pollutantKeys: PollutantType[] = [
    'pm2_5',
    'pm10',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'carbon_monoxide',
    'ozone',
  ];

  const pollutants: PollutantDetail[] = pollutantKeys.map((pKey) => {
    const meta = POLLUTANTS_METADATA[pKey];
    let rawConc = 0;
    let displayConc = 0;

    switch (pKey) {
      case 'pm2_5':
        rawConc = current?.pm2_5 ?? 0;
        displayConc = Number(rawConc.toFixed(1));
        break;
      case 'pm10':
        rawConc = current?.pm10 ?? 0;
        displayConc = Number(rawConc.toFixed(1));
        break;
      case 'nitrogen_dioxide':
        rawConc = current?.nitrogen_dioxide ?? 0;
        displayConc = Number(rawConc.toFixed(1));
        break;
      case 'sulphur_dioxide':
        rawConc = current?.sulphur_dioxide ?? 0;
        displayConc = Number(rawConc.toFixed(1));
        break;
      case 'carbon_monoxide':
        rawConc = current?.carbon_monoxide ?? 0; // in µg/m³
        displayConc = Number((rawConc / 1000).toFixed(2)); // in mg/m³
        break;
      case 'ozone':
        rawConc = current?.ozone ?? 0;
        displayConc = Number(rawConc.toFixed(1));
        break;
    }

    const subIndex = cpcbResult.subIndices[pKey];
    const category = subIndex !== null ? getAqiCategory(subIndex) : null;

    let statusText = 'Normal';
    if (category === 'Good') statusText = 'Clean & Favorable';
    else if (category === 'Satisfactory') statusText = 'Acceptable';
    else if (category === 'Moderately Polluted') statusText = 'Elevated';
    else if (category === 'Poor') statusText = 'Unhealthy';
    else if (category === 'Very Poor') statusText = 'Hazardous';
    else if (category === 'Severe') statusText = 'Emergency';

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

  // 3. Process Hourly Forecast & Trends
  const hourlyRaw = raw.hourly;
  const hourlyPoints: HourlyAqiPoint[] = [];

  if (hourlyRaw && hourlyRaw.time && hourlyRaw.time.length > 0) {
    const nowMs = Date.now();

    for (let i = 0; i < hourlyRaw.time.length; i++) {
      const timeStr = hourlyRaw.time[i];
      const pointTimeMs = new Date(timeStr).getTime();

      // Skip records older than 2 hours to keep the chart focused on current + upcoming
      if (pointTimeMs < nowMs - 2 * 3600 * 1000) {
        continue;
      }

      const pm25 = hourlyRaw.pm2_5?.[i] ?? 0;
      const pm10 = hourlyRaw.pm10?.[i] ?? 0;
      const no2 = hourlyRaw.nitrogen_dioxide?.[i] ?? null;
      const so2 = hourlyRaw.sulphur_dioxide?.[i] ?? null;
      const coUg = hourlyRaw.carbon_monoxide?.[i] ?? null;
      const coMg = coUg !== null ? coUg / 1000 : null;
      const o3 = hourlyRaw.ozone?.[i] ?? null;

      const calc = calculateCpcbAqi(
        {
          pm2_5: pm25,
          pm10: pm10,
          nitrogen_dioxide: no2,
          sulphur_dioxide: so2,
          carbon_monoxide: coMg,
          ozone: o3,
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
  }

  // 4. Calculate Daily Summary (next 5 days)
  const dailySummaries: DailyAqiSummary[] = [];
  const daysGroup: Record<string, HourlyAqiPoint[]> = {};

  hourlyPoints.forEach((pt) => {
    const dayKey = pt.time.split('T')[0];
    if (!daysGroup[dayKey]) daysGroup[dayKey] = [];
    daysGroup[dayKey].push(pt);
  });

  Object.entries(daysGroup).forEach(([dateStr, pts]) => {
    if (pts.length === 0) return;
    const aqiValues = pts.map((p) => p.aqi);
    const minAqi = Math.min(...aqiValues);
    const maxAqi = Math.max(...aqiValues);
    const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
    const category = getAqiCategory(avgAqi);
    const { formatted, dayName } = formatDateString(dateStr);

    let recommendation = 'Safe for outdoor plans.';
    if (category === 'Moderately Polluted') recommendation = 'Caution for sensitive groups.';
    else if (category === 'Poor') recommendation = 'Reduce prolonged outdoor exertion.';
    else if (category === 'Very Poor') recommendation = 'Wear N95 masks; avoid outdoor sports.';
    else if (category === 'Severe') recommendation = 'Stay indoors; emergency pollution.';

    dailySummaries.push({
      date: dateStr,
      formattedDate: formatted,
      dayName,
      minAqi,
      maxAqi,
      avgAqi,
      category,
      dominantPollutant: pts[0]?.dominantPollutant?.replace('_', ' ').toUpperCase() || 'PM2.5',
      recommendation,
    });
  });

  // 5. Best Outdoor Windows (Next 18 hours)
  const bestWindows: OutdoorWindow[] = [];
  const windowSlice = hourlyPoints.slice(0, 18);
  for (let i = 0; i <= windowSlice.length - 3; i += 3) {
    const chunk = windowSlice.slice(i, i + 3);
    if (chunk.length === 3) {
      const avg = Math.round(chunk.reduce((sum, p) => sum + p.aqi, 0) / 3);
      const cat = getAqiCategory(avg);
      let suitability: OutdoorWindow['suitability'] = 'Acceptable';
      let reason = 'Normal conditions for daily activities.';

      if (avg <= 50) {
        suitability = 'Ideal';
        reason = 'Cleanest period for cardiovascular exercise and sports.';
      } else if (avg <= 100) {
        suitability = 'Ideal';
        reason = 'Air quality is favorable with minor health impact.';
      } else if (avg <= 200) {
        suitability = 'Acceptable';
        reason = 'Fine for healthy adults; sensitive groups should avoid heavy exertion.';
      } else if (avg <= 300) {
        suitability = 'Caution';
        reason = 'High particulate matter; consider moving workouts indoors.';
      } else {
        suitability = 'Avoid';
        reason = 'Hazardous smog concentration; avoid outdoor exposure.';
      }

      bestWindows.push({
        startTime: chunk[0].time,
        endTime: chunk[2].time,
        formattedTimeRange: `${chunk[0].formattedTime} - ${chunk[2].formattedTime}`,
        avgAqi: avg,
        category: cat,
        suitability,
        recommendedActivities:
          suitability === 'Ideal'
            ? ['Running', 'Cycling', 'Outdoor Sports', 'Walking']
            : suitability === 'Acceptable'
            ? ['Brisk Walking', 'Commuting', 'Light Chores']
            : suitability === 'Caution'
            ? ['Essential Transit', 'Short Walks with Mask']
            : ['Indoor Workouts Only'],
        reason,
      });
    }
  }

  // 6. Peak Pollution detection
  let peakPollution: AirQualityResponse['forecast']['peakPollution'] = null;
  if (hourlyPoints.length > 0) {
    const sorted = [...hourlyPoints].sort((a, b) => b.aqi - a.aqi);
    const peak = sorted[0];
    if (peak) {
      peakPollution = {
        time: peak.time,
        formattedTime: peak.formattedTime,
        aqi: peak.aqi,
        category: peak.category,
        pollutant: peak.dominantPollutant?.replace('_', ' ').toUpperCase() || 'PM2.5',
      };
    }
  }

  // 7. Metadata calculation
  const totalMonitored = pollutants.filter((p) => p.subIndex !== null).length;
  const coveragePercent = Math.round((totalMonitored / 6) * 100);

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
