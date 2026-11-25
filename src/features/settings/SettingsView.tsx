'use client';

import React, { useState } from 'react';
import { loadUserPreferences, saveUserPreferences } from '@/lib/storage/preferences';
import { UserPreferences, UserActivity, UserSensitivity } from '@/types/user';
import { QUICK_CITIES } from '@/constants/cities';
import {
  Settings,
  Bell,
  CheckCircle2,
  RotateCcw,
  Shield,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadUserPreferences());
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleUpdate = (updated: Partial<UserPreferences>) => {
    const newPrefs = saveUserPreferences(updated);
    setPrefs(newPrefs);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset all saved local preferences to initial defaults?')) {
      localStorage.removeItem('airaware_user_preferences_v1');
      const reset = loadUserPreferences();
      setPrefs(reset);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Settings className="text-emerald-600" size={28} />
            User Preferences & Alert Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalize your default location, activity, sensitivity level, and custom air alert thresholds.
          </p>
        </div>

        {savedFeedback && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 size={14} /> Saved locally
          </span>
        )}
      </div>

      {/* Default Location */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label
            htmlFor="settings-default-city"
            className="block text-base font-bold text-slate-900 dark:text-white"
          >
            Default City / Home Location
          </label>
          <p className="text-xs text-slate-500">
            Automatically loads air quality intelligence for this location on every visit
          </p>
        </div>

        <select
          id="settings-default-city"
          value={prefs.preferredLocation.id}
          onChange={(e) => {
            const loc = QUICK_CITIES.find((c) => c.id === e.target.value);
            if (loc) handleUpdate({ preferredLocation: loc });
          }}
          className="w-full sm:w-80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          {QUICK_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.admin1})
            </option>
          ))}
        </select>
      </div>

      {/* Routine Activity & Sensitivity */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Health & Lifestyle Profile
          </h3>
          <p className="text-xs text-slate-500">
            Calibrates personalized AI health advice and activity window suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="settings-activity"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Primary Routine Activity
            </label>
            <select
              id="settings-activity"
              value={prefs.activity}
              onChange={(e) => handleUpdate({ activity: e.target.value as UserActivity })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            >
              <option value="walking">Walking & Errands</option>
              <option value="running">Running / High-intensity Jogging</option>
              <option value="cycling">Cycling</option>
              <option value="outdoor_sports">Outdoor Sports & Games</option>
              <option value="school_commute">School Commuting (Children)</option>
              <option value="daily_commuting">Daily Transit / Office Commute</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="settings-sensitivity"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Vulnerability Profile
            </label>
            <select
              id="settings-sensitivity"
              value={prefs.sensitivity}
              onChange={(e) => handleUpdate({ sensitivity: e.target.value as UserSensitivity })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            >
              <option value="general">General Population (Healthy Adults)</option>
              <option value="children">Children & Adolescents</option>
              <option value="older_adults">Older Adults (60+)</option>
              <option value="respiratory_cardiac">Respiratory & Cardiac Sensitivity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Center Preferences */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-emerald-600" />
            Air Alert Center Thresholds
          </h3>
          <p className="text-xs text-slate-500">
            Configure custom thresholds to trigger in-app alerts and notifications
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <label htmlFor="settings-aqi-threshold">Notify me when AQI exceeds:</label>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                AQI {prefs.aqiAlertThreshold}
              </span>
            </div>
            <input
              id="settings-aqi-threshold"
              type="range"
              min="100"
              max="400"
              step="25"
              value={prefs.aqiAlertThreshold}
              onChange={(e) => handleUpdate({ aqiAlertThreshold: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Moderate (100)</span>
              <span>Poor (200)</span>
              <span>Very Poor (300)</span>
              <span>Severe (400)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.enableSuddenSpikeAlerts}
                onChange={(e) => handleUpdate({ enableSuddenSpikeAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Warn me about upcoming sudden spikes (&gt;= +40 AQI within 6 hours)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.enableBrowserAlerts}
                onChange={async (e) => {
                  if (e.target.checked) {
                    if (typeof window !== 'undefined' && 'Notification' in window) {
                      const res = await Notification.requestPermission();
                      handleUpdate({ enableBrowserAlerts: res === 'granted' });
                    }
                  } else {
                    handleUpdate({ enableBrowserAlerts: false });
                  }
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Enable OS / Desktop Browser Push Notifications
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Notice & Reset */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-600 shrink-0" />
          <span>
            Preferences are strictly saved in your browser&apos;s local storage. No account creation or personal data collection required.
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 font-semibold"
        >
          <RotateCcw size={14} />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
