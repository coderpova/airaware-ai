import React from 'react';
import { DailyAqiSummary } from '@/types/aqi';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface FiveDayForecastListProps {
  daily: DailyAqiSummary[];
}

export const FiveDayForecastList: React.FC<FiveDayForecastListProps> = ({ daily }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          5-Day Air Quality Outlook
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aggregated daily averages and anticipated public-health precautions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {daily.map((day, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">{day.dayName}</span>
                <span>{day.formattedDate}</span>
              </div>

              <div className="my-3 text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {day.avgAqi}
                </div>
                <div className="mt-1 flex justify-center">
                  <AqiBadge category={day.category} size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 py-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ArrowDown size={13} /> {day.minAqi}
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 font-semibold">
                  <ArrowUp size={13} /> {day.maxAqi}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Key Concern: {day.dominantPollutant}
              </span>
              <p>{day.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
