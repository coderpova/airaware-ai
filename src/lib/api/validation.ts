import { z } from 'zod';

export const AirQualityQuerySchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
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
