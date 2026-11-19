'use client';

import React from 'react';
import { CityComparisonView } from '@/features/comparison/CityComparisonView';
import { Columns } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Columns className="text-emerald-600" size={28} />
          Multi-City Air Quality Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Benchmarking particulate burdens, dominant atmospheric contributors, and public health conditions across Indian urban centers.
        </p>
      </div>

      <CityComparisonView />
    </div>
  );
}
