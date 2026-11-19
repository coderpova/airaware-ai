import { describe, it, expect } from 'vitest';
import { generateHealthAdvisory, MEDICAL_DISCLAIMER } from './insight-engine';

describe('AI Health & Activity Insight Engine', () => {
  it('generates fine particulate insights when PM2.5 is dominant', () => {
    const report = generateHealthAdvisory({
      aqi: 220,
      category: 'Poor',
      dominantPollutant: 'pm2_5',
      activity: 'running',
      sensitivity: 'general',
      locationName: 'Delhi',
    });

    expect(report.mainConcern).toContain('Fine particulates (PM2.5)');
    expect(report.mainConcern).toContain('alveoli');
    expect(report.activityGuidance.suitability).toBe('Caution');
    expect(report.medicalDisclaimer).toBe(MEDICAL_DISCLAIMER);
  });

  it('generates coarse dust insights when PM10 is dominant', () => {
    const report = generateHealthAdvisory({
      aqi: 140,
      category: 'Moderately Polluted',
      dominantPollutant: 'pm10',
      activity: 'walking',
      sensitivity: 'children',
      locationName: 'Greater Noida',
    });

    expect(report.mainConcern).toContain('Coarse suspended dust (PM10)');
    expect(report.sensitivityImpact).toContain('Children');
    expect(report.indoorVentilation.action).toBe('Ventilate Briefly during Clean Hours');
  });

  it('recommends N95 respirators for Severe air quality', () => {
    const report = generateHealthAdvisory({
      aqi: 430,
      category: 'Severe',
      dominantPollutant: 'pm2_5',
      activity: 'school_commute',
      sensitivity: 'respiratory_cardiac',
      locationName: 'Lucknow',
    });

    expect(report.maskRecommendation.needed).toBe(true);
    expect(report.maskRecommendation.type).toContain('N95');
    expect(report.indoorVentilation.action).toBe('Seal Openings & Run HEPA');
    expect(report.activityGuidance.suitability).toBe('Avoid');
    expect(report.activityGuidance.recommendedIntensity).toBe('Cancel / Reschedule');
  });

  it('triggers forecast surge warning when upcoming AQI increases sharply', () => {
    const mockHourly = [
      {
        time: '2026-11-19T10:00:00Z',
        formattedTime: '10:00 AM',
        aqi: 160,
        category: 'Moderately Polluted' as const,
        pm2_5: 80,
        pm10: 120,
        dominantPollutant: 'pm2_5' as const,
        isForecast: true,
      },
      {
        time: '2026-11-19T13:00:00Z',
        formattedTime: '1:00 PM',
        aqi: 260,
        category: 'Poor' as const,
        pm2_5: 140,
        pm10: 220,
        dominantPollutant: 'pm2_5' as const,
        isForecast: true,
      },
      {
        time: '2026-11-19T16:00:00Z',
        formattedTime: '4:00 PM',
        aqi: 280,
        category: 'Poor' as const,
        pm2_5: 160,
        pm10: 240,
        dominantPollutant: 'pm2_5' as const,
        isForecast: true,
      },
    ];

    const report = generateHealthAdvisory({
      aqi: 160,
      category: 'Moderately Polluted',
      dominantPollutant: 'pm2_5',
      activity: 'running',
      sensitivity: 'general',
      hourlyForecast: mockHourly,
      locationName: 'Bengaluru',
    });

    expect(report.forecastWarning).not.toBeNull();
    expect(report.forecastWarning).toContain('surge by +120 AQI points');
    expect(report.bestOutdoorWindows.length).toBeGreaterThan(0);
  });
});
