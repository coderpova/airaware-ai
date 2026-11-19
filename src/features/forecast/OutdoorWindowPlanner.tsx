import React from 'react';
import { OutdoorWindow } from '@/types/aqi';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { Clock, Zap } from 'lucide-react';

interface OutdoorWindowPlannerProps {
  windows: OutdoorWindow[];
  peakPollution?: {
    time: string;
    formattedTime: string;
    aqi: number;
    category: string;
    pollutant: string;
  } | null;
}

export const OutdoorWindowPlanner: React.FC<OutdoorWindowPlannerProps> = ({
  windows,
  peakPollution,
}) => {
  return (
    <div className="space-y-4">
      {/* Peak Warning Box */}
      {peakPollution && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                Forecasted Peak Pollution Alert
              </span>
              <h4 className="text-base font-bold text-red-900 dark:text-red-200 mt-0.5">
                Expected Peak: AQI {peakPollution.aqi} ({peakPollution.category}) at {peakPollution.formattedTime}
              </h4>
              <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                Highest atmospheric concentration driven primarily by {peakPollution.pollutant}. Avoid strenuous outdoor workouts during this window.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-end sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
              Avoid Outdoors
            </span>
          </div>
        </div>
      )}

      {/* Recommended Windows */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Optimal Outdoor Activity Windows
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Categorized time slots for outdoor runs, daily walks, sports, and school commute
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {windows.map((win, idx) => {
            const isIdeal = win.suitability === 'Ideal';
            const isAcceptable = win.suitability === 'Acceptable';
            const isCaution = win.suitability === 'Caution';

            return (
              <div
                key={idx}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 shadow-xs ${
                  isIdeal
                    ? 'border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/10'
                    : isAcceptable
                    ? 'border-blue-200 dark:border-blue-800'
                    : isCaution
                    ? 'border-amber-200 dark:border-amber-800'
                    : 'border-red-200 dark:border-red-800 bg-red-50/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <Clock size={14} className="text-slate-400" />
                      <span>{win.formattedTimeRange}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isIdeal
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : isAcceptable
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : isCaution
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {win.suitability}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      AQI {win.avgAqi}
                    </span>
                    <AqiBadge category={win.category} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {win.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Recommended For:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {win.recommendedActivities.map((act, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
