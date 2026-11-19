import { CPCB_BREAKPOINTS, CPCB_CATEGORIES } from '@/constants/breakpoints';
import { AqiCategory, CpcbCalculationResult, PollutantType } from '@/types/aqi';

/**
 * Calculates CPCB Sub-Index for a single pollutant using official piecewise linear interpolation.
 *
 * Formula:
 * Ip = [ (I_HI - I_LO) / (B_HI - B_LO) ] * (Cp - B_LO) + I_LO
 *
 * @param pollutant The pollutant key
 * @param concentration The concentration (µg/m³ for particulates/NO2/SO2/O3, mg/m³ for CO)
 * @returns rounded integer sub-index or null if invalid
 */
export function calculateSubIndex(
  pollutant: PollutantType,
  concentration: number | null | undefined
): number | null {
  if (concentration === null || concentration === undefined || isNaN(concentration) || concentration < 0) {
    return null;
  }

  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints || breakpoints.length === 0) {
    return null;
  }

  // If concentration is at or below zero
  if (concentration === 0) {
    return 0;
  }

  // Check which range it falls into
  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (concentration >= bp.bLo && concentration <= bp.bHi) {
      const subIndex =
        ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (concentration - bp.bLo) + bp.iLo;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds the highest breakpoint, it is in the Severe category (capped at 500)
  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.bHi) {
    return 500;
  }

  return null;
}

/**
 * Classifies an AQI numeric value into official CPCB category.
 */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderately Polluted';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export interface PollutantRawInputs {
  pm2_5?: number | null;
  pm10?: number | null;
  nitrogen_dioxide?: number | null;
  sulphur_dioxide?: number | null;
  carbon_monoxide?: number | null; // Note: if passed in µg/m³, specify isCoInMg = false
  ozone?: number | null;
}

/**
 * Computes the National Air Quality Index according to CPCB guidelines.
 *
 * CPCB Official Criteria:
 * 1. Minimum 3 pollutants must be monitored.
 * 2. At least one particulate matter (PM2.5 or PM10) MUST be present.
 * 3. Overall AQI is the maximum of individual sub-indices.
 * 4. Dominant pollutant is the one with the highest sub-index.
 *
 * If criteria are not met, the result is marked as an estimate with appropriate warnings.
 */
export function calculateCpcbAqi(
  inputs: PollutantRawInputs,
  options: { isCoInMg?: boolean; isModelForecast?: boolean } = {}
): CpcbCalculationResult {
  const { isCoInMg = true, isModelForecast = true } = options;

  // Process CO concentration (convert µg/m³ to mg/m³ if needed)
  let coConcentration = inputs.carbon_monoxide;
  if (coConcentration !== null && coConcentration !== undefined && !isCoInMg) {
    coConcentration = coConcentration / 1000;
  }

  // Calculate sub-indices
  const subIndices: Record<PollutantType, number | null> = {
    pm2_5: calculateSubIndex('pm2_5', inputs.pm2_5),
    pm10: calculateSubIndex('pm10', inputs.pm10),
    nitrogen_dioxide: calculateSubIndex('nitrogen_dioxide', inputs.nitrogen_dioxide),
    sulphur_dioxide: calculateSubIndex('sulphur_dioxide', inputs.sulphur_dioxide),
    carbon_monoxide: calculateSubIndex('carbon_monoxide', coConcentration),
    ozone: calculateSubIndex('ozone', inputs.ozone),
  };

  const validEntries = Object.entries(subIndices).filter(
    (entry): entry is [PollutantType, number] => entry[1] !== null
  );

  const monitoredCount = validEntries.length;
  const hasParticulate = subIndices.pm2_5 !== null || subIndices.pm10 !== null;
  const isCpcbCompliant = monitoredCount >= 3 && hasParticulate;

  const warnings: string[] = [];

  if (isModelForecast) {
    warnings.push(
      'Modelled atmospheric chemistry estimate (Open-Meteo numerical weather & dispersion simulation), not an official CPCB Continuous Ambient Air Quality Monitoring Station (CAAQMS) sensor.'
    );
  }

  if (monitoredCount === 0) {
    warnings.push('No valid pollutant data available to calculate an AQI.');
    return {
      aqi: 0,
      category: 'Good',
      dominantPollutant: null,
      dominantPollutantName: null,
      subIndices,
      isEstimate: true,
      isCpcbCompliant: false,
      monitoredPollutantsCount: 0,
      hasParticulate: false,
      warnings,
      methodologyNotes: 'Insufficient data points to perform CPCB sub-index calculations.',
      calculatedAt: new Date().toISOString(),
    };
  }

  if (monitoredCount < 3) {
    warnings.push(
      `Only ${monitoredCount} pollutant(s) available. Official CPCB standards mandate at least 3 monitored pollutants.`
    );
  }

  if (!hasParticulate) {
    warnings.push(
      'Neither PM2.5 nor PM10 data is available. CPCB guidelines require at least one particulate matter for an official index.'
    );
  }

  // Find max sub-index and dominant pollutant
  let maxSubIndex = 0;
  let dominantPollutant: PollutantType | null = null;

  for (const [pollutant, subIndex] of validEntries) {
    if (subIndex > maxSubIndex) {
      maxSubIndex = subIndex;
      dominantPollutant = pollutant;
    }
  }

  const pollutantNames: Record<PollutantType, string> = {
    pm2_5: 'PM2.5 (Fine Particulates)',
    pm10: 'PM10 (Coarse Particulates)',
    nitrogen_dioxide: 'Nitrogen Dioxide (NO₂)',
    sulphur_dioxide: 'Sulphur Dioxide (SO₂)',
    carbon_monoxide: 'Carbon Monoxide (CO)',
    ozone: 'Ozone (O₃)',
  };

  const dominantName = dominantPollutant ? pollutantNames[dominantPollutant] : null;
  const category = getAqiCategory(maxSubIndex);

  const methodologyNotes = isCpcbCompliant
    ? `Calculated using official CPCB piecewise linear sub-index interpolation across ${monitoredCount} monitored parameters. Max sub-index: ${maxSubIndex} (${dominantName}).`
    : `CPCB-inspired estimate based on ${monitoredCount} parameter(s). Lacks full official station criteria (${!hasParticulate ? 'missing particulates' : 'fewer than 3 pollutants'}).`;

  return {
    aqi: maxSubIndex,
    category,
    dominantPollutant,
    dominantPollutantName: dominantName,
    subIndices,
    isEstimate: !isCpcbCompliant || isModelForecast,
    isCpcbCompliant,
    monitoredPollutantsCount: monitoredCount,
    hasParticulate,
    warnings,
    methodologyNotes,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Returns user-facing styling & metadata for a given category.
 */
export function getCategoryInfo(category: AqiCategory) {
  return CPCB_CATEGORIES[category] || CPCB_CATEGORIES.Good;
}
