export type AqiCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderately Polluted'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface AqiCategoryInfo {
  category: AqiCategory;
  range: [number, number];
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  healthStatement: string;
  iconName: string;
}

export type PollutantType =
  | 'pm2_5'
  | 'pm10'
  | 'nitrogen_dioxide'
  | 'sulphur_dioxide'
  | 'carbon_monoxide'
  | 'ozone';

export interface PollutantDetail {
  id: PollutantType;
  name: string;
  chemicalFormula: string;
  unit: string;
  rawConcentration: number;
  displayConcentration: number;
  averagingHours: number;
  subIndex: number | null;
  category: AqiCategory | null;
  statusText: string;
  sources: string[];
  healthEffects: string[];
  citizenPrecaution: string;
  cpcbStandard24hOr8h: number; // Indian standard (e.g. 60 for PM2.5, 100 for PM10)
}

export interface CpcbCalculationResult {
  aqi: number;
  category: AqiCategory;
  dominantPollutant: PollutantType | null;
  dominantPollutantName: string | null;
  subIndices: Record<PollutantType, number | null>;
  isEstimate: boolean;
  isCpcbCompliant: boolean; // Meets >=3 pollutants including PM10 or PM2.5
  monitoredPollutantsCount: number;
  hasParticulate: boolean;
  warnings: string[];
  methodologyNotes: string;
  calculatedAt: string;
}

export interface HourlyAqiPoint {
  time: string; // ISO string
  formattedTime: string;
  aqi: number;
  category: AqiCategory;
  pm2_5: number;
  pm10: number;
  dominantPollutant: PollutantType | null;
  isForecast: boolean;
}

export interface DailyAqiSummary {
  date: string;
  formattedDate: string;
  dayName: string;
  minAqi: number;
  maxAqi: number;
  avgAqi: number;
  category: AqiCategory;
  dominantPollutant: string;
  recommendation: string;
}

export interface OutdoorWindow {
  startTime: string;
  endTime: string;
  formattedTimeRange: string;
  avgAqi: number;
  category: AqiCategory;
  suitability: 'Ideal' | 'Acceptable' | 'Caution' | 'Avoid';
  recommendedActivities: string[];
  reason: string;
}
