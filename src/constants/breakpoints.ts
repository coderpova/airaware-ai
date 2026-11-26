import { AqiCategory, AqiCategoryInfo, PollutantType } from '@/types/aqi';

export interface BreakpointRange {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
  category: AqiCategory;
}

/**
 * Official Central Pollution Control Board (CPCB) India Breakpoints Matrix
 * Reference: Ministry of Environment, Forest & Climate Change / CPCB "National Air Quality Index"
 *
 * Concentrations:
 * - PM10: 24-hr avg (µg/m³)
 * - PM2.5: 24-hr avg (µg/m³)
 * - NO2: 24-hr avg (µg/m³)
 * - O3: 8-hr avg (µg/m³)
 * - CO: 8-hr avg (mg/m³) [Note: Open-Meteo returns µg/m³, so must convert /1000]
 * - SO2: 24-hr avg (µg/m³)
 */

export const CPCB_BREAKPOINTS: Record<PollutantType, BreakpointRange[]> = {
  pm2_5: [
    { bLo: 0, bHi: 30, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 31, bHi: 60, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 61, bHi: 90, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 91, bHi: 120, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 121, bHi: 250, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 251, bHi: 380, iLo: 401, iHi: 500, category: 'Severe' },
  ],
  pm10: [
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 51, bHi: 100, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 101, bHi: 250, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 251, bHi: 350, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 351, bHi: 430, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 431, bHi: 500, iLo: 401, iHi: 500, category: 'Severe' },
  ],
  nitrogen_dioxide: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 41, bHi: 80, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 81, bHi: 180, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 181, bHi: 280, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 281, bHi: 400, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 401, bHi: 500, iLo: 401, iHi: 500, category: 'Severe' },
  ],
  sulphur_dioxide: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 41, bHi: 80, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 81, bHi: 380, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 381, bHi: 800, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 801, bHi: 1600, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 1601, bHi: 2000, iLo: 401, iHi: 500, category: 'Severe' },
  ],
  carbon_monoxide: [
    // In mg/m³
    { bLo: 0, bHi: 1.0, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 1.1, bHi: 2.0, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 2.1, bHi: 10.0, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 10.1, bHi: 17.0, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 17.1, bHi: 34.0, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 34.1, bHi: 50.0, iLo: 401, iHi: 500, category: 'Severe' },
  ],
  ozone: [
    // In µg/m³
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50, category: 'Good' },
    { bLo: 51, bHi: 100, iLo: 51, iHi: 100, category: 'Satisfactory' },
    { bLo: 101, bHi: 168, iLo: 101, iHi: 200, category: 'Moderately Polluted' },
    { bLo: 169, bHi: 208, iLo: 201, iHi: 300, category: 'Poor' },
    { bLo: 209, bHi: 748, iLo: 301, iHi: 400, category: 'Very Poor' },
    { bLo: 749, bHi: 1000, iLo: 401, iHi: 500, category: 'Severe' },
  ],
};

export const CPCB_CATEGORIES: Record<AqiCategory, AqiCategoryInfo> = {
  Good: {
    category: 'Good',
    range: [0, 50],
    color: '#10B981', // emerald-500
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderLight: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    description: 'Clean and safe air with minimal health impact.',
    healthStatement: 'Minimal health impact; safe for all outdoor activities.',
    iconName: 'ShieldCheck',
  },
  Satisfactory: {
    category: 'Satisfactory',
    range: [51, 100],
    color: '#84CC16', // lime-500
    bgLight: 'bg-lime-50 dark:bg-lime-950/30',
    borderLight: 'border-lime-200 dark:border-lime-800',
    textColor: 'text-lime-700 dark:text-lime-400',
    badgeBg: 'bg-lime-100 dark:bg-lime-900/40',
    badgeText: 'text-lime-800 dark:text-lime-300',
    description: 'Acceptable air quality for the general public.',
    healthStatement: 'Minor breathing discomfort to highly sensitive individuals.',
    iconName: 'CheckCircle2',
  },
  'Moderately Polluted': {
    category: 'Moderately Polluted',
    range: [101, 200],
    color: '#F59E0B', // amber-500
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    borderLight: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    description: 'Noticeable pollution levels; caution for sensitive groups.',
    healthStatement: 'Breathing discomfort to individuals with lung or heart ailments, children, and elderly.',
    iconName: 'AlertTriangle',
  },
  Poor: {
    category: 'Poor',
    range: [201, 300],
    color: '#F97316', // orange-500
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderLight: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/40',
    badgeText: 'text-orange-800 dark:text-orange-300',
    description: 'Unhealthy air; outdoor exertion should be reduced.',
    healthStatement: 'Breathing discomfort to most people on prolonged exposure; severe discomfort to sensitive groups.',
    iconName: 'AlertCircle',
  },
  'Very Poor': {
    category: 'Very Poor',
    range: [301, 400],
    color: '#EF4444', // red-500
    bgLight: 'bg-red-50 dark:bg-red-950/30',
    borderLight: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-900/40',
    badgeText: 'text-red-800 dark:text-red-300',
    description: 'High health hazard; avoid non-essential outdoor exposure.',
    healthStatement: 'Respiratory illness to people on prolonged exposure; pronounced adverse effects for vulnerable groups.',
    iconName: 'AlertOctagon',
  },
  Severe: {
    category: 'Severe',
    range: [401, 500],
    color: '#7C3AED', // purple-600 / maroon
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    borderLight: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-800 dark:text-purple-300',
    description: 'Emergency conditions; serious impacts even during light physical activity.',
    healthStatement: 'Affects healthy people and seriously impacts those with existing diseases; keep outdoor activity minimal.',
    iconName: 'ShieldAlert',
  },
};
