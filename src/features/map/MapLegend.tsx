import React from 'react';
import { CPCB_CATEGORIES } from '@/constants/breakpoints';
import { AqiCategory } from '@/types/aqi';

export const MapLegend: React.FC = () => {
  const categories = Object.keys(CPCB_CATEGORIES) as AqiCategory[];

  return (
    <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-2">
      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3">
        <span>CPCB AQI Scale</span>
        <span className="text-[10px] text-slate-400 font-normal">Modelled Estimates</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((catKey) => {
          const item = CPCB_CATEGORIES[catKey];
          return (
            <div key={catKey} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                {catKey} ({item.range[0]}-{item.range[1]})
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-tight">
        OpenStreetMap & Open-Meteo Dispersion Simulation
      </div>
    </div>
  );
};
