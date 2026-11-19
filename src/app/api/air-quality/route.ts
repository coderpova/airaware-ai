import { NextRequest, NextResponse } from 'next/server';
import { AirQualityQuerySchema } from '@/lib/api/validation';
import { fetchAirQualityData } from '@/lib/api/open-meteo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      name: searchParams.get('name') ?? undefined,
      admin1: searchParams.get('admin1') ?? undefined,
      country: searchParams.get('country') ?? undefined,
    };

    const validationResult = AirQualityQuerySchema.safeParse(rawParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { latitude, longitude, name, admin1, country } = validationResult.data;

    const data = await fetchAirQualityData({
      latitude,
      longitude,
      locationName: name,
      admin1,
      country,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown air quality fetch error';
    return NextResponse.json(
      {
        error: 'Failed to retrieve air quality data',
        message,
      },
      { status: 502 }
    );
  }
}
