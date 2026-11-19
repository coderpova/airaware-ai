'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CpcbCalculationResult, HourlyAqiPoint } from '@/types/aqi';
import { SystemAlert, UserPreferences } from '@/types/user';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Bell } from 'lucide-react';

interface LiveAlertCenterProps {
  cpcb: CpcbCalculationResult;
  hourlyForecast: HourlyAqiPoint[];
  locationName: string;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const LiveAlertCenter: React.FC<LiveAlertCenterProps> = ({
  cpcb,
  hourlyForecast,
  locationName,
  preferences,
  onUpdatePreferences,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  // Compute active alerts deterministically from props
  const activeAlerts = useMemo(() => {
    const alerts: SystemAlert[] = [];
    const threshold = preferences.aqiAlertThreshold || 200;

    // 1. Current AQI severity alert
    if (cpcb.aqi >= 401) {
      alerts.push({
        id: `severe-${locationName}-${Math.floor(cpcb.aqi / 10)}`,
        type: 'severe_aqi',
        title: `CRITICAL ALERT: Severe Pollution in ${locationName} (AQI ${cpcb.aqi})`,
        message:
          'Emergency air conditions detected. Even healthy adults may experience respiratory irritation. Stay indoors and seal windows.',
        severity: 'critical',
        timestamp: cpcb.calculatedAt,
        locationName,
        aqiValue: cpcb.aqi,
        triggerCondition: 'AQI exceeds 400',
      });
    } else if (cpcb.aqi >= 301) {
      alerts.push({
        id: `very-poor-${locationName}-${Math.floor(cpcb.aqi / 10)}`,
        type: 'very_poor_aqi',
        title: `HAZARD WARNING: Very Poor Air Quality in ${locationName} (AQI ${cpcb.aqi})`,
        message:
          'Prolonged outdoor exposure can cause respiratory distress. Certified N95 masks strongly recommended outdoors.',
        severity: 'danger',
        timestamp: cpcb.calculatedAt,
        locationName,
        aqiValue: cpcb.aqi,
        triggerCondition: 'AQI exceeds 300',
      });
    } else if (cpcb.aqi >= threshold) {
      alerts.push({
        id: `threshold-${locationName}-${Math.floor(cpcb.aqi / 10)}`,
        type: 'poor_aqi',
        title: `Advisory: Air Quality Exceeds Your Custom Alert Threshold (AQI ${cpcb.aqi})`,
        message: `Current AQI (${cpcb.aqi}) has surpassed your configured limit of ${threshold}. Consider moderating outdoor exercise.`,
        severity: 'warning',
        timestamp: cpcb.calculatedAt,
        locationName,
        aqiValue: cpcb.aqi,
        triggerCondition: `AQI exceeded user threshold (${threshold})`,
      });
    }

    // 2. Sudden pollution spike alert from forecast
    if (hourlyForecast.length >= 6 && preferences.enableSuddenSpikeAlerts) {
      const next6Hours = hourlyForecast.slice(0, 6);
      const maxFuture = Math.max(...next6Hours.map((p) => p.aqi));
      const delta = maxFuture - cpcb.aqi;

      if (delta >= 40 && maxFuture >= 180) {
        alerts.push({
          id: `spike-${locationName}-${Math.floor(maxFuture / 10)}`,
          type: 'sudden_spike',
          title: `Upcoming Spike Warning: +${delta} AQI points projected in next 6 hours`,
          message: `Pollution levels are projected to surge from ${cpcb.aqi} to ${maxFuture}. Complete essential outdoor activities immediately or reschedule.`,
          severity: 'warning',
          timestamp: cpcb.calculatedAt,
          locationName,
          aqiValue: maxFuture,
          triggerCondition: 'Forecast surge >= 40 AQI points',
        });
      }
    }

    return alerts.filter((a) => !dismissedAlertIds.has(a.id));
  }, [cpcb.aqi, cpcb.calculatedAt, hourlyForecast, locationName, preferences, dismissedAlertIds]);

  // Trigger browser notification if permitted and new
  useEffect(() => {
    if (
      activeAlerts.length > 0 &&
      preferences.enableBrowserAlerts &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const highest = activeAlerts[0];
      try {
        new Notification(highest.title, {
          body: highest.message,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore notification errors
      }
    }
  }, [activeAlerts, preferences.enableBrowserAlerts]);

  const handleDismiss = (id: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(id));
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        onUpdatePreferences({ enableBrowserAlerts: true });
      } else {
        onUpdatePreferences({ enableBrowserAlerts: false });
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-3">
      {/* Active System Alerts */}
      {activeAlerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          type={alert.severity === 'critical' || alert.severity === 'danger' ? 'danger' : 'warning'}
          title={alert.title}
          message={alert.message}
          onDismiss={() => handleDismiss(alert.id)}
        />
      ))}

      {/* Browser Notification Opt-In Bar (if not yet granted) */}
      {notificationPermission !== 'granted' && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Bell size={16} className="text-emerald-600 shrink-0" />
            <span>
              Enable desktop alerts to get timely warnings when air quality deteriorates in {locationName}.
            </span>
          </div>

          <button
            type="button"
            onClick={handleRequestNotificationPermission}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Enable Alerts
          </button>
        </div>
      )}
    </div>
  );
};
