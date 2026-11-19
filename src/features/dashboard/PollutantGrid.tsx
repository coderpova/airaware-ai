'use client';

import React, { useState } from 'react';
import { PollutantDetail } from '@/types/aqi';
import { MetricCard } from '@/components/ui/MetricCard';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface PollutantGridProps {
  pollutants: PollutantDetail[];
  dominantPollutantId?: string | null;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({
  pollutants,
  dominantPollutantId,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Key Pollutant Concentrations & Sub-Indices
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assessed against National Ambient Air Quality Standards (NAAQS) & CPCB sub-index breakpoints
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutants.map((p) => {
          const isDominant = p.id === dominantPollutantId;
          const isExpanded = expandedId === p.id;
          const ratio = (p.displayConcentration / p.cpcbStandard24hOr8h) * 100;
          const isExceeded = p.displayConcentration > p.cpcbStandard24hOr8h;

          return (
            <MetricCard
              key={p.id}
              title={`${p.name} (${p.chemicalFormula})`}
              value={p.displayConcentration}
              unit={p.unit}
              isDominant={isDominant}
              statusBadge={
                p.category ? (
                  <div className="flex items-center gap-2">
                    <AqiBadge category={p.category} aqi={p.subIndex} size="sm" />
                    <span className="text-[11px] text-slate-400">Sub-Index</span>
                  </div>
                ) : null
              }
              standardComparison={`NAAQS Standard: ${p.cpcbStandard24hOr8h} ${p.unit} (${p.averagingHours}h avg)`}
              subtitle={
                isExceeded ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={13} />
                    {Math.round(ratio)}% of safe standard threshold
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Within safe standard ({Math.round(ratio)}%)
                  </span>
                )
              }
              footer={
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(p.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
                    aria-expanded={isExpanded}
                  >
                    <span>Pollution Intelligence & Health Impact</span>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <strong className="block text-slate-900 dark:text-white font-semibold">
                          Common Sources:
                        </strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-500 dark:text-slate-400">
                          {p.sources.slice(0, 2).map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <strong className="block text-slate-900 dark:text-white font-semibold">
                          Health Impact:
                        </strong>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                          {p.healthEffects[0]}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="block font-semibold text-emerald-800 dark:text-emerald-300 text-[11px] mb-0.5">
                          Protective Precaution:
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                          {p.citizenPrecaution}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
};
