import { describe, it, expect } from 'vitest';
import { processAirQualityPayload } from './open-meteo';
import { OpenMeteoAirQualityRaw } from '@/types/api';

describe('Open-Meteo Air Quality Payload Processor', () => {
  const mockRawPayload: OpenMeteoAirQualityRaw = {
    latitude: 28.6139,
    longitude: 77.209,
    generationtime_ms: 0.5,
    utc_offset_seconds: 19800,
    timezone: 'Asia/Kolkata',
    timezone_abbreviation: 'IST',
    elevation: 216,
    current: {
      time: '2026-11-19T18:00',
      interval: 3600,
      pm2_5: 85.5,
      pm10: 165.2,
      carbon_monoxide: 2200, // 2.2 mg/m³
      nitrogen_dioxide: 45.3,
      sulphur_dioxide: 22.1,
      ozone: 38.0,
      us_aqi: 166,
      european_aqi: 80,
    },
    hourly: {
      time: [
        '2026-11-19T18:00',
        '2026-11-19T19:00',
        '2026-11-19T20:00',
        '2026-11-19T21:00',
        '2026-11-19T22:00',
      ],
      pm2_5: [85.5, 95.0, 110.0, 125.0, 130.0],
      pm10: [165.2, 180.0, 210.0, 240.0, 255.0],
      nitrogen_dioxide: [45.3, 50.0, 55.0, 60.0, 65.0],
      sulphur_dioxide: [22.1, 23.0, 24.0, 25.0, 26.0],
      carbon_monoxide: [2200, 2300, 2400, 2500, 2600],
      ozone: [38.0, 35.0, 30.0, 28.0, 25.0],
    },
  };

  it('correctly processes and normalizes the payload into CPCB result', () => {
    const result = processAirQualityPayload(mockRawPayload, {
      name: 'Delhi',
      admin1: 'NCT of Delhi',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.209,
    });

    expect(result.location.name).toBe('Delhi');
    expect(result.current.cpcb.isCpcbCompliant).toBe(true);
    expect(result.current.cpcb.dominantPollutant).toBe('pm2_5');
    expect(result.current.pollutants).toHaveLength(6);

    const pm25Item = result.current.pollutants.find((p) => p.id === 'pm2_5');
    expect(pm25Item?.displayConcentration).toBe(85.5);
    expect(pm25Item?.unit).toBe('µg/m³');

    const coItem = result.current.pollutants.find((p) => p.id === 'carbon_monoxide');
    expect(coItem?.displayConcentration).toBe(2.2); // 2200 µg/m³ -> 2.2 mg/m³
    expect(coItem?.unit).toBe('mg/m³');

    expect(result.current.usAqi).toBe(166);
    expect(result.current.europeanAqi).toBe(80);
    expect(result.metadata.dataSource).toContain('Open-Meteo');
  });

  it('aggregates hourly points and outdoor windows properly', () => {
    const result = processAirQualityPayload(mockRawPayload, {
      name: 'Delhi',
      country: 'India',
      latitude: 28.6139,
      longitude: 77.209,
    });

    expect(result.forecast.hourly.length).toBeGreaterThan(0);
    expect(result.metadata.dataCoveragePercent).toBe(100);
  });
});
