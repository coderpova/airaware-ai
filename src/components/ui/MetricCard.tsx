import React from 'react';
import { cn } from '@/lib/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: React.ReactNode;
  statusBadge?: React.ReactNode;
  icon?: React.ReactNode;
  standardComparison?: string;
  footer?: React.ReactNode;
  className?: string;
  isDominant?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  statusBadge,
  icon,
  standardComparison,
  footer,
  className,
  isDominant = false,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl p-5 border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md',
        isDominant
          ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800',
        className
      )}
    >
      {isDominant && (
        <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
          Dominant Pollutant
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>

        {statusBadge && <div className="mt-2">{statusBadge}</div>}

        {standardComparison && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            {standardComparison}
          </p>
        )}

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {footer && <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
    </div>
  );
};
