'use client';

import React, { useState, useEffect } from 'react';
import { AirQualityResponse } from '@/types/api';
import { SavedLocation, UserPreferences } from '@/types/user';
import { DEFAULT_LOCATION } from '@/constants/cities';
import { loadUserPreferences, saveUserPreferences, addRecentLocation } from '@/lib/storage/preferences';
import { generateHealthAdvisory } from '@/lib/ai/insight-engine';
import { QuickCitySelector } from '@/features/dashboard/QuickCitySelector';
import { AqiGauge } from '@/features/dashboard/AqiGauge';
import { PollutantGrid } from '@/features/dashboard/PollutantGrid';
import { LiveAlertCenter } from '@/features/dashboard/LiveAlertCenter';
import { AqiMethodologyDrawer } from '@/features/dashboard/AqiMethodologyDrawer';
import { HourlyAqiChart } from '@/features/forecast/HourlyAqiChart';
import { OutdoorWindowPlanner } from '@/features/forecast/OutdoorWindowPlanner';
import { AlertCircle, RefreshCw, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation>(
    () => loadUserPreferences().preferredLocation || DEFAULT_LOCATION
  );
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Fetch air quality data asynchronously
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const query = new URLSearchParams({
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
          name: selectedLocation.name,
          admin1: selectedLocation.admin1 || '',
          country: selectedLocation.country || '',
        });

        const res = await fetch(`/api/air-quality?${query.toString()}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || `Failed to fetch air quality data (HTTP ${res.status})`);
        }

        const data: AirQualityResponse = await res.json();
        if (isMounted) {
          setAirData(data);
          setLoading(false);
          setError(null);
          addRecentLocation(selectedLocation);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error retrieving air quality data';
          setError(msg);
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, fetchTrigger]);

  const handleSelectLocation = (loc: SavedLocation) => {
    setLoading(true);
    setSelectedLocation(loc);
  };

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    const next = saveUserPreferences(updated);
    setPreferences(next);
  };

  // Generate explainable AI summary if data is ready
  const aiAdvisory = airData
    ? generateHealthAdvisory({
        aqi: airData.current.cpcb.aqi,
        category: airData.current.cpcb.category,
        dominantPollutant: airData.current.cpcb.dominantPollutant,
        activity: preferences.activity,
        sensitivity: preferences.sensitivity,
        hourlyForecast: airData.forecast.hourly,
        locationName: airData.location.name,
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Search and Quick City Selector */}
      <QuickCitySelector
        currentLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        isLoading={loading}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setFetchTrigger((c) => c + 1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !airData && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      {airData && (
        <>
          {/* Live Alert Center */}
          <LiveAlertCenter
            cpcb={airData.current.cpcb}
            hourlyForecast={airData.forecast.hourly}
            locationName={airData.location.name}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />

          {/* Top Row: Gauge + Quick AI Advisory Snippet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AqiGauge
                cpcb={airData.current.cpcb}
                usAqi={airData.current.usAqi}
                europeanAqi={airData.current.europeanAqi}
                locationName={airData.location.name}
                timestamp={airData.current.formattedTimestamp}
                onOpenMethodology={() => setMethodologyOpen(true)}
              />
            </div>

            {/* AI Assistant Quick Snapshot Card */}
            {aiAdvisory && (
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <Bot size={18} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        AI Health Engine
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Deterministic Advisory
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3">
                    {aiAdvisory.summaryTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {aiAdvisory.advisoryText}
                  </p>

                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Routine Check for {aiAdvisory.activityGuidance.activityLabel}:
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      Status: <strong>{aiAdvisory.activityGuidance.suitability}</strong> • {aiAdvisory.activityGuidance.specificAdvice[0]}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 italic">
                    Based on CPCB & WHO guidelines
                  </span>
                  <Link
                    href="/assistant"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Full Health Plan</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Key Pollutants Grid */}
          <PollutantGrid
            pollutants={airData.current.pollutants}
            dominantPollutantId={airData.current.cpcb.dominantPollutant}
          />

          {/* 24-Hour Forecast Chart Preview */}
          <div className="space-y-4">
            <HourlyAqiChart data={airData.forecast.hourly} hoursCount={24} />
          </div>

          {/* Outdoor Activity Windows */}
          <OutdoorWindowPlanner
            windows={airData.forecast.bestWindows}
            peakPollution={airData.forecast.peakPollution}
          />

          {/* CPCB Methodology Drawer */}
          <AqiMethodologyDrawer
            isOpen={methodologyOpen}
            onClose={() => setMethodologyOpen(false)}
            cpcb={airData.current.cpcb}
            coveragePercent={airData.metadata.dataCoveragePercent}
          />
        </>
      )}
    </div>
  );
}
