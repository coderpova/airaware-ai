import { describe, it, expect } from 'vitest';
import { AirQualityQuerySchema, GeocodingQuerySchema } from './validation';

describe('API Input Validation Schemas', () => {
  describe('AirQualityQuerySchema', () => {
    it('accepts valid latitude and longitude coordinates', () => {
      const valid = {
        latitude: '28.6139',
        longitude: '77.2090',
        name: 'Delhi',
      };
      const result = AirQualityQuerySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latitude).toBe(28.6139);
        expect(result.data.longitude).toBe(77.209);
        expect(result.data.name).toBe('Delhi');
      }
    });

    it('rejects out-of-range latitude (> 90 or < -90)', () => {
      const invalidLat = { latitude: 95.5, longitude: 77.2 };
      const result = AirQualityQuerySchema.safeParse(invalidLat);
      expect(result.success).toBe(false);
    });

    it('rejects out-of-range longitude (> 180 or < -180)', () => {
      const invalidLon = { latitude: 28.6, longitude: 195.0 };
      const result = AirQualityQuerySchema.safeParse(invalidLon);
      expect(result.success).toBe(false);
    });

    it('rejects non-numeric coordinate values', () => {
      const invalid = { latitude: 'abc', longitude: 'xyz' };
      const result = AirQualityQuerySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects missing, null, and empty coordinate parameters', () => {
      expect(AirQualityQuerySchema.safeParse({}).success).toBe(false);
      expect(AirQualityQuerySchema.safeParse({ latitude: null, longitude: null }).success).toBe(false);
      expect(AirQualityQuerySchema.safeParse({ latitude: '', longitude: '' }).success).toBe(false);
      expect(AirQualityQuerySchema.safeParse({ latitude: '   ', longitude: '77.2' }).success).toBe(false);
    });

    it('accepts valid zero coordinates', () => {
      const zero = { latitude: '0', longitude: '0' };
      const result = AirQualityQuerySchema.safeParse(zero);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latitude).toBe(0);
        expect(result.data.longitude).toBe(0);
      }
    });
  });

  describe('GeocodingQuerySchema', () => {
    it('accepts valid city queries and trims whitespace', () => {
      const valid = { name: '  Bengaluru  ', count: '5' };
      const result = GeocodingQuerySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Bengaluru');
        expect(result.data.count).toBe(5);
      }
    });

    it('sanitizes harmful HTML characters from search query', () => {
      const malicious = { name: '<script>alert("xss")</script>Mumbai' };
      const result = GeocodingQuerySchema.safeParse(malicious);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).not.toContain('<');
        expect(result.data.name).not.toContain('>');
      }
    });

    it('rejects empty query string', () => {
      const empty = { name: '' };
      const result = GeocodingQuerySchema.safeParse(empty);
      expect(result.success).toBe(false);
    });
  });
});
