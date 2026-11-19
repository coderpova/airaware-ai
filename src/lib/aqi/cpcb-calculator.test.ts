import { describe, it, expect } from 'vitest';
import { calculateSubIndex, getAqiCategory, calculateCpcbAqi } from './cpcb-calculator';

describe('CPCB Sub-Index Calculation', () => {
  it('correctly calculates PM2.5 sub-index across breakpoints', () => {
    // 0-30 -> 0-50 (Good)
    expect(calculateSubIndex('pm2_5', 0)).toBe(0);
    expect(calculateSubIndex('pm2_5', 15)).toBe(25);
    expect(calculateSubIndex('pm2_5', 30)).toBe(50);

    // 31-60 -> 51-100 (Satisfactory)
    // Formula: (100-51)/(60-31) * (45.5-31) + 51 = (49/29)*14.5 + 51 = 24.5 + 51 = 76
    const subMidSatisfactory = calculateSubIndex('pm2_5', 45.5);
    expect(subMidSatisfactory).toBeGreaterThanOrEqual(75);
    expect(subMidSatisfactory).toBeLessThanOrEqual(77);

    // 61-90 -> 101-200 (Moderately Polluted)
    expect(calculateSubIndex('pm2_5', 61)).toBe(101);
    expect(calculateSubIndex('pm2_5', 90)).toBe(200);

    // 91-120 -> 201-300 (Poor)
    expect(calculateSubIndex('pm2_5', 91)).toBe(201);
    expect(calculateSubIndex('pm2_5', 120)).toBe(300);

    // 121-250 -> 301-400 (Very Poor)
    expect(calculateSubIndex('pm2_5', 121)).toBe(301);
    expect(calculateSubIndex('pm2_5', 250)).toBe(400);

    // 251-380 -> 401-500 (Severe)
    expect(calculateSubIndex('pm2_5', 380)).toBe(500);

    // Extreme high value > 380 capped at 500
    expect(calculateSubIndex('pm2_5', 550)).toBe(500);
  });

  it('correctly calculates PM10 sub-index', () => {
    expect(calculateSubIndex('pm10', 25)).toBe(25);
    expect(calculateSubIndex('pm10', 50)).toBe(50);
    expect(calculateSubIndex('pm10', 100)).toBe(100);
    expect(calculateSubIndex('pm10', 250)).toBe(200);
    expect(calculateSubIndex('pm10', 350)).toBe(300);
    expect(calculateSubIndex('pm10', 430)).toBe(400);
    expect(calculateSubIndex('pm10', 500)).toBe(500);
    expect(calculateSubIndex('pm10', 700)).toBe(500);
  });

  it('correctly calculates CO sub-index with mg/m³ values', () => {
    // 0 - 1.0 mg/m³ -> 0 - 50
    expect(calculateSubIndex('carbon_monoxide', 1.0)).toBe(50);
    // 1.1 - 2.0 mg/m³ -> 51 - 100
    expect(calculateSubIndex('carbon_monoxide', 2.0)).toBe(100);
    // 2.1 - 10.0 mg/m³ -> 101 - 200
    expect(calculateSubIndex('carbon_monoxide', 10.0)).toBe(200);
  });

  it('handles negative or invalid concentrations gracefully', () => {
    expect(calculateSubIndex('pm2_5', -10)).toBeNull();
    expect(calculateSubIndex('pm2_5', null)).toBeNull();
    expect(calculateSubIndex('pm2_5', undefined)).toBeNull();
    expect(calculateSubIndex('pm2_5', NaN)).toBeNull();
  });
});

describe('CPCB AQI Category Classification', () => {
  it('correctly classifies numeric AQI into standard CPCB categories', () => {
    expect(getAqiCategory(0)).toBe('Good');
    expect(getAqiCategory(50)).toBe('Good');
    expect(getAqiCategory(51)).toBe('Satisfactory');
    expect(getAqiCategory(100)).toBe('Satisfactory');
    expect(getAqiCategory(101)).toBe('Moderately Polluted');
    expect(getAqiCategory(200)).toBe('Moderately Polluted');
    expect(getAqiCategory(201)).toBe('Poor');
    expect(getAqiCategory(300)).toBe('Poor');
    expect(getAqiCategory(301)).toBe('Very Poor');
    expect(getAqiCategory(400)).toBe('Very Poor');
    expect(getAqiCategory(401)).toBe('Severe');
    expect(getAqiCategory(500)).toBe('Severe');
    expect(getAqiCategory(650)).toBe('Severe');
  });
});

describe('CPCB Aggregate AQI and Compliance Evaluation', () => {
  it('computes compliant CPCB AQI when >=3 pollutants including PM2.5 are present', () => {
    const result = calculateCpcbAqi({
      pm2_5: 75, // Moderate (~150)
      pm10: 80, // Satisfactory (80)
      nitrogen_dioxide: 40, // Good (50)
      sulphur_dioxide: 20, // Good (25)
    });

    expect(result.isCpcbCompliant).toBe(true);
    expect(result.monitoredPollutantsCount).toBe(4);
    expect(result.hasParticulate).toBe(true);
    expect(result.category).toBe('Moderately Polluted');
    expect(result.dominantPollutant).toBe('pm2_5');
    expect(result.aqi).toBeGreaterThanOrEqual(140);
  });

  it('marks as non-compliant when fewer than 3 pollutants are present', () => {
    const result = calculateCpcbAqi({
      pm2_5: 45,
      pm10: 70,
    });

    expect(result.isCpcbCompliant).toBe(false);
    expect(result.monitoredPollutantsCount).toBe(2);
    expect(result.warnings.some((w) => w.includes('at least 3'))).toBe(true);
  });

  it('marks as non-compliant when particulates (PM2.5 / PM10) are missing', () => {
    const result = calculateCpcbAqi({
      nitrogen_dioxide: 50,
      sulphur_dioxide: 30,
      ozone: 40,
    });

    expect(result.isCpcbCompliant).toBe(false);
    expect(result.hasParticulate).toBe(false);
    expect(result.warnings.some((w) => w.includes('Neither PM2.5 nor PM10'))).toBe(true);
  });

  it('handles CO unit conversion from µg/m³ correctly', () => {
    const result = calculateCpcbAqi(
      {
        pm2_5: 25,
        pm10: 40,
        carbon_monoxide: 2000, // 2000 µg/m³ = 2.0 mg/m³
      },
      { isCoInMg: false }
    );

    expect(result.subIndices.carbon_monoxide).toBe(100);
    expect(result.dominantPollutant).toBe('carbon_monoxide');
    expect(result.category).toBe('Satisfactory');
  });

  it('handles empty or all-null inputs safely', () => {
    const result = calculateCpcbAqi({});
    expect(result.aqi).toBe(0);
    expect(result.monitoredPollutantsCount).toBe(0);
    expect(result.isCpcbCompliant).toBe(false);
    expect(result.dominantPollutant).toBeNull();
  });
});
