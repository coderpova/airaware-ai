import React from 'react';
import { HealthAdvisoryReport } from '@/lib/ai/insight-engine';
import {
  ShieldCheck,
  AlertTriangle,
  Home,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HealthAdvisoryCardProps {
  advisory: HealthAdvisoryReport;
  locationName: string;
}

export const HealthAdvisoryCard: React.FC<HealthAdvisoryCardProps> = ({
  advisory,
  locationName,
}) => {
  const { activityGuidance, maskRecommendation, indoorVentilation } = advisory;

  const suitabilityBadgeStyle = () => {
    switch (activityGuidance.suitability) {
      case 'Safe':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Acceptable':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      case 'Caution':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'Avoid':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              AirAware Explainable AI Health Engine • {locationName}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {advisory.summaryTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {advisory.pollutionSummary}
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${suitabilityBadgeStyle()}`}
          >
            {activityGuidance.suitability === 'Safe' ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertTriangle size={15} />
            )}
            Activity Status: {activityGuidance.suitability}
          </span>
        </div>
      </div>

      {/* Main Pollution Concern & Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Primary Environmental Driver
          </span>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {advisory.mainConcern}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Vulnerability Profile Assessment
          </span>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {advisory.sensitivityImpact}
          </p>
        </div>
      </div>

      {/* Protection Measures: Mask & Ventilation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mask */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Respiratory Protection (Mask)
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {maskRecommendation.type}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {maskRecommendation.rationale}
            </p>
          </div>
        </div>

        {/* Indoor Ventilation */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 shrink-0">
            <Home size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Indoor Ventilation Advice
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {indoorVentilation.action}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {indoorVentilation.description}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Specific Recommendations */}
      <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Practical Advice for {activityGuidance.activityLabel}
          </h4>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Intensity: <strong>{activityGuidance.recommendedIntensity}</strong>
          </span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {activityGuidance.specificAdvice.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-600 mt-0.5 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-xs text-slate-500">
          <Clock size={14} className="text-slate-400" />
          <span>Optimal Window: <strong>{activityGuidance.bestTimeSuggestion}</strong></span>
        </div>
      </div>

      {/* Forecast Surge Alert (if any) */}
      {advisory.forecastWarning && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{advisory.forecastWarning}</p>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed italic">
        {advisory.medicalDisclaimer}
      </div>
    </div>
  );
};
