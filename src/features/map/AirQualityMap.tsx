'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SavedLocation } from '@/types/user';

interface CityMapData {
  location: SavedLocation;
  aqi: number;
  pm2_5: number;
  pm10: number;
  dominant: string;
}

interface AirQualityMapProps {
  center: [number, number];
  zoom?: number;
  citiesData: CityMapData[];
  selectedCity?: SavedLocation | null;
  onSelectCity?: (loc: SavedLocation) => void;
}

const DynamicMap = dynamic(
  () => import('./AirQualityMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Initializing Interactive OpenStreetMap...</span>
      </div>
    ),
  }
);

export const AirQualityMap: React.FC<AirQualityMapProps> = (props) => {
  return <DynamicMap {...props} />;
};
