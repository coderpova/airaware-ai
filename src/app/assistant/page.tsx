'use client';

import React, { useState, useEffect } from 'react';
import { AirQualityResponse } from '@/types/api';
import { SavedLocation, UserActivity, UserSensitivity } from '@/types/user';
import { DEFAULT_LOCATION } from '@/constants/cities';
import { loadUserPreferences, saveUserPreferences } from '@/lib/storage/preferences';
import { generateHealthAdvisory } from '@/lib/ai/insight-engine';
import { ActivitySelector } from '@/features/assistant/ActivitySelector';
import { SensitivitySelector } from '@/features/assistant/SensitivitySelector';
import { HealthAdvisoryCard } from '@/features/assistant/HealthAdvisoryCard';
import { QuickCitySelector } from '@/features/dashboard/QuickCitySelector';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export default function AssistantPage() {
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation>(
    () => loadUserPreferences().preferredLocation || DEFAULT_LOCATION
  );
  const [activity, setActivity] = useState<UserActivity>(
    () => loadUserPreferences().activity || 'walking'
  );
  const [sensitivity, setSensitivity] = useState<UserSensitivity>(
    () => loadUserPreferences().sensitivity || 'general'
  );
  const [airData, setAirData] = useState<AirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
          name: selectedLocation.name,
          admin1: selectedLocation.admin1 || '',
          country: selectedLocation.country || '',
        });
        const res = await fetch(`/api/air-quality?${query.toString()}`);
        if (res.ok) {
          const data: AirQualityResponse = await res.json();
          setAirData(data);
        }
      } catch (err) {
        console.error('Failed to load air data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedLocation]);

  const handleActivityChange = (act: UserActivity) => {
    setActivity(act);
    saveUserPreferences({ activity: act });
  };

  const handleSensitivityChange = (sens: UserSensitivity) => {
    setSensitivity(sens);
    saveUserPreferences({ sensitivity: sens });
  };

  const advisory = airData
    ? generateHealthAdvisory({
        aqi: airData.current.cpcb.aqi,
        category: airData.current.cpcb.category,
        dominantPollutant: airData.current.cpcb.dominantPollutant,
        activity,
        sensitivity,
        hourlyForecast: airData.forecast.hourly,
        locationName: airData.location.name,
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bot className="text-emerald-600" size={28} />
            AI Health & Activity Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic, explainable risk assessment engine tailored to your activity and personal health sensitivity profile.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <Sparkles size={14} />
          <span>Conservative Public Health Benchmarks</span>
        </div>
      </div>

      {/* City Switcher */}
      <QuickCitySelector
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        isLoading={loading}
      />

      {/* Selectors for Activity and Sensitivity */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <ActivitySelector selected={activity} onSelect={handleActivityChange} />
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <SensitivitySelector selected={sensitivity} onSelect={handleSensitivityChange} />
        </div>
      </div>

      {/* Generated AI Advisory */}
      {loading && !airData ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Evaluating contextual environmental risks...</span>
        </div>
      ) : advisory && airData ? (
        <HealthAdvisoryCard advisory={advisory} locationName={airData.location.name} />
      ) : null}
    </div>
  );
}
