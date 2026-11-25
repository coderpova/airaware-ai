import { z } from 'zod';

const requiredCoordinate = (min: number, max: number, label: string) =>
  z.preprocess(
    (val) => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return val;
    },
    z.coerce
      .number()
      .finite(`${label} must be a valid finite number`)
      .min(min, `${label} must be between ${min} and ${max}`)
      .max(max, `${label} must be between ${min} and ${max}`)
  );

export const AirQualityQuerySchema = z.object({
  latitude: requiredCoordinate(-90, 90, 'Latitude'),
  longitude: requiredCoordinate(-180, 180, 'Longitude'),
  name: z.string().max(120).optional().default('Current Location'),
  admin1: z.string().max(120).optional(),
  country: z.string().max(120).optional().default(''),
});

export const GeocodingQuerySchema = z.object({
  name: z
    .string()
    .min(1, 'City or place query is required')
    .max(100, 'Query too long')
    .transform((val) => val.trim().replace(/[<>%$]/g, '')), // Sanitize
  count: z.coerce.number().int().min(1).max(20).default(8),
});

export type ValidatedAirQualityQuery = z.infer<typeof AirQualityQuerySchema>;
export type ValidatedGeocodingQuery = z.infer<typeof GeocodingQuerySchema>;
