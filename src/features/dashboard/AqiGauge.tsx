'use client';

import React from 'react';
import { CpcbCalculationResult } from '@/types/aqi';
import { getCategoryInfo } from '@/lib/aqi/cpcb-calculator';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { AlertTriangle, Clock, Info } from 'lucide-react';

interface AqiGaugeProps {
  cpcb: CpcbCalculationResult;
  usAqi?: number | null;
  europeanAqi?: number | null;
  locationName: string;
  timestamp: string;
  onOpenMethodology?: () => void;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({
  cpcb,
  usAqi,
  europeanAqi,
  locationName,
  timestamp,
  onOpenMethodology,
}) => {
  const { aqi, category, dominantPollutantName, isEstimate } = cpcb;
  const categoryInfo = getCategoryInfo(category);

  // SVG Gauge computation
  // Arc angle from -120 deg to +120 deg (total 240 deg)
  const clampedAqi = Math.min(Math.max(aqi, 0), 500);
  const percentage = clampedAqi / 500;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  // We only use 240/360 of the circle (0.6667)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - percentage * arcLength;

  return (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Air Quality Index
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {locationName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMethodology && (
            <button
              onClick={onOpenMethodology}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="View AQI calculation methodology"
            >
              <Info size={14} />
              <span>CPCB Methodology</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Gauge */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-56 h-48 sm:w-64 sm:h-52 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-[210deg]"
            viewBox="0 0 220 220"
            aria-hidden="true"
          >
            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="16"
              stroke="currentColor"
              fill="transparent"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Value Progress */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              style={{
                stroke: categoryInfo.color,
                transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease',
              }}
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central Values */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-4">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{ color: categoryInfo.color }}
            >
              {aqi}
            </span>
            <div className="mt-1">
              <AqiBadge category={category} size="md" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Scale: 0 – 500 (CPCB)
            </span>
          </div>
        </div>

        {/* Estimation Notice */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <span>
            {isEstimate ? 'Model-derived CPCB-inspired estimate' : 'CPCB sub-index standard'}
          </span>
        </div>
      </div>

      {/* Dominant Pollutant & Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Dominant Pollutant:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {dominantPollutantName || 'None identified'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 sm:justify-end">
          <Clock size={13} />
          <span>Updated: {timestamp}</span>
        </div>
      </div>

      {/* Comparative International Indices (Explicitly Separated as Mandated) */}
      {(usAqi !== null || europeanAqi !== null) && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 font-medium">Comparative Indices:</span>
          <div className="flex items-center gap-3">
            {usAqi !== null && usAqi !== undefined && (
              <span className="text-slate-700 dark:text-slate-300">
                US EPA AQI: <strong className="text-slate-900 dark:text-white">{usAqi}</strong>
              </span>
            )}
            {europeanAqi !== null && europeanAqi !== undefined && (
              <span className="text-slate-700 dark:text-slate-300">
                European AQI (CAQI):{' '}
                <strong className="text-slate-900 dark:text-white">{europeanAqi}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
