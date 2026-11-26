import { AirQualityResponse } from '@/types/api';
import { SavedLocation } from '@/types/user';

/**
 * Fetches normalized CPCB air quality data for a given location from the internal API route.
 */
export async function fetchCityAirQuality(
  location: Pick<SavedLocation, 'latitude' | 'longitude' | 'name' | 'admin1' | 'country'>,
  signal?: AbortSignal
): Promise<AirQualityResponse> {
  const query = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    name: location.name,
  });

  if (location.admin1) query.set('admin1', location.admin1);
  if (location.country) query.set('country', location.country);

  const res = await fetch(`/api/air-quality?${query.toString()}`, { signal });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const message =
      typeof errJson?.message === 'string' && errJson.message
        ? errJson.message
        : `Failed to fetch air quality data (HTTP ${res.status})`;
    throw new Error(message);
  }

  return res.json() as Promise<AirQualityResponse>;
}
