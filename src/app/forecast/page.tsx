'use client';

import React, { useState, useEffect } from 'react';
import { AirQualityResponse } from '@/types/api';
import { SavedLocation } from '@/types/user';
import { DEFAULT_LOCATION } from '@/constants/cities';
import { loadUserPreferences } from '@/lib/storage/preferences';
import { fetchCityAirQuality } from '@/lib/api/client';
import { QuickCitySelector } from '@/features/dashboard/QuickCitySelector';
import { HourlyAqiChart } from '@/features/forecast/HourlyAqiChart';
import { PollutantTrendsChart } from '@/features/forecast/PollutantTrendsChart';
import { OutdoorWindowPlanner } from '@/features/forecast/OutdoorWindowPlanner';
import { FiveDayForecastList } from '@/features/forecast/FiveDayForecastList';
import { TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

export default function ForecastPage() {
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation>(
    () => loadUserPreferences().preferredLocation || DEFAULT_LOCATION
  );
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchCityAirQuality(selectedLocation, controller.signal);
        if (!controller.signal.aborted) {
          setAirData(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Failed to load forecast', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => controller.abort();
  }, [selectedLocation]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="text-emerald-600" size={28} />
            Air Quality Forecast & Outlook
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            48-hour hourly atmospheric dispersion simulation and 5-day predictive trajectory for {selectedLocation.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <AlertTriangle size={15} className="text-amber-500" />
          <span>Forecasts model forward atmospheric physics & emissions</span>
        </div>
      </div>

      {/* City Switcher */}
      <QuickCitySelector
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        isLoading={loading}
      />

      {loading && !airData ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Computing multi-pollutant trajectory models...</span>
        </div>
      ) : airData ? (
        <>
          {/* Outdoor Activity Windows & Peak Warning */}
          <OutdoorWindowPlanner
            windows={airData.forecast.bestWindows}
            peakPollution={airData.forecast.peakPollution}
          />

          {/* 48-Hour Hourly Trend Chart */}
          <HourlyAqiChart
            data={airData.forecast.hourly}
            title={`48-Hour Hourly CPCB AQI Forecast in ${airData.location.name}`}
            hoursCount={48}
          />

          {/* PM2.5 vs PM10 Hourly Dynamics */}
          <PollutantTrendsChart data={airData.forecast.hourly} hoursCount={24} />

          {/* 5-Day Outlook */}
          <FiveDayForecastList daily={airData.forecast.daily} />
        </>
      ) : null}
    </div>
  );
}
