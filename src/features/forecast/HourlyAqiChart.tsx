'use client';

import React, { useState } from 'react';
import { HourlyAqiPoint } from '@/types/aqi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { useIsClient } from '@/hooks/useIsClient';

interface HourlyAqiChartProps {
  data: HourlyAqiPoint[];
  title?: string;
  hoursCount?: 24 | 48;
}

export const HourlyAqiChart: React.FC<HourlyAqiChartProps> = ({
  data,
  title = '24-Hour Air Quality Forecast & Trend',
  hoursCount = 24,
}) => {
  const isClient = useIsClient();
  const [selectedRange, setSelectedRange] = useState<24 | 48>(hoursCount);

  const chartData = data.slice(0, selectedRange);

  if (!isClient) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
        Loading interactive forecast visualization...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hourly CPCB-inspired estimated AQI trend derived from numerical dispersion models
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedRange(24)}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedRange === 24
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            24 Hours
          </button>
          <button
            type="button"
            onClick={() => setSelectedRange(48)}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedRange === 48
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            48 Hours
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="formattedTime"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, (dataMax: number) => Math.max(Math.ceil((dataMax + 40) / 50) * 50, 300)]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
            />

            {/* CPCB Threshold Reference Lines */}
            <ReferenceLine y={100} stroke="#84CC16" strokeDasharray="3 3" label={{ value: 'Satisfactory (100)', fill: '#65A30D', fontSize: 10 }} />
            <ReferenceLine y={200} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Moderate (200)', fill: '#D97706', fontSize: 10 }} />
            <ReferenceLine y={300} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Poor (300)', fill: '#DC2626', fontSize: 10 }} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as HourlyAqiPoint;
                  return (
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3">
                        <span>{pt.formattedTime}</span>
                        <span className="text-[10px] text-slate-400">
                          {pt.isForecast ? 'Forecast' : 'Recent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-black text-lg text-slate-900 dark:text-white">
                          AQI {pt.aqi}
                        </span>
                        <AqiBadge category={pt.category} size="sm" />
                      </div>
                      <div className="text-slate-500 text-[11px] pt-1">
                        PM2.5: <strong>{pt.pm2_5} µg/m³</strong> • PM10: <strong>{pt.pm10} µg/m³</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#aqiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Screen Reader Table Summary for Accessibility */}
      <details className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <summary className="cursor-pointer font-medium hover:text-slate-700 dark:hover:text-slate-300">
          View Accessible Forecast Data Table (Screen Reader Friendly)
        </summary>
        <div className="mt-2 overflow-x-auto max-h-48">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                <th className="py-1">Time</th>
                <th className="py-1">CPCB AQI</th>
                <th className="py-1">Category</th>
                <th className="py-1">PM2.5 (µg/m³)</th>
                <th className="py-1">PM10 (µg/m³)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((pt, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                  <td className="py-1">{pt.formattedTime}</td>
                  <td className="py-1 font-bold">{pt.aqi}</td>
                  <td className="py-1">{pt.category}</td>
                  <td className="py-1">{pt.pm2_5}</td>
                  <td className="py-1">{pt.pm10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};
