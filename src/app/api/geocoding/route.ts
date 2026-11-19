import { NextRequest, NextResponse } from 'next/server';
import { GeocodingQuerySchema } from '@/lib/api/validation';
import { searchLocations } from '@/lib/api/open-meteo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      name: searchParams.get('q') || searchParams.get('name') || '',
      count: searchParams.get('count') ?? undefined,
    };

    const validationResult = GeocodingQuerySchema.safeParse(rawParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, count } = validationResult.data;
    const results = await searchLocations(name, count);

    return NextResponse.json(
      {
        query: name,
        count: results.length,
        results,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown geocoding error';
    return NextResponse.json(
      {
        error: 'Failed to search locations',
        message,
      },
      { status: 502 }
    );
  }
}
