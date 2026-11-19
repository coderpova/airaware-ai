import { AqiCategory, CpcbCalculationResult, DailyAqiSummary, HourlyAqiPoint, OutdoorWindow, PollutantDetail } from './aqi';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  timezone?: string;
  population?: number;
  postcodes?: string[];
}

export interface OpenMeteoHourly {
  time: string[];
  pm10?: (number | null)[];
  pm2_5?: (number | null)[];
  carbon_monoxide?: (number | null)[];
  nitrogen_dioxide?: (number | null)[];
  sulphur_dioxide?: (number | null)[];
  ozone?: (number | null)[];
  us_aqi?: (number | null)[];
  european_aqi?: (number | null)[];
}

export interface OpenMeteoCurrent {
  time: string;
  interval: number;
  pm10?: number | null;
  pm2_5?: number | null;
  carbon_monoxide?: number | null;
  nitrogen_dioxide?: number | null;
  sulphur_dioxide?: number | null;
  ozone?: number | null;
  us_aqi?: number | null;
  european_aqi?: number | null;
}

export interface OpenMeteoAirQualityRaw {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units?: Record<string, string>;
  current?: OpenMeteoCurrent;
  hourly_units?: Record<string, string>;
  hourly?: OpenMeteoHourly;
}

export interface AirQualityResponse {
  location: {
    name: string;
    admin1?: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    timestamp: string;
    formattedTimestamp: string;
    cpcb: CpcbCalculationResult;
    pollutants: PollutantDetail[];
    usAqi: number | null;
    europeanAqi: number | null;
  };
  forecast: {
    hourly: HourlyAqiPoint[];
    daily: DailyAqiSummary[];
    bestWindows: OutdoorWindow[];
    peakPollution: {
      time: string;
      formattedTime: string;
      aqi: number;
      category: AqiCategory;
      pollutant: string;
    } | null;
  };
  metadata: {
    dataSource: string;
    modelType: string;
    attribution: string;
    dataCoveragePercent: number;
    retrievedAt: string;
  };
}
