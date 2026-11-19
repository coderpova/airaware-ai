'use client';

import React from 'react';
import { HourlyAqiPoint } from '@/types/aqi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useIsClient } from '@/hooks/useIsClient';

interface PollutantTrendsChartProps {
  data: HourlyAqiPoint[];
  hoursCount?: number;
}

export const PollutantTrendsChart: React.FC<PollutantTrendsChartProps> = ({
  data,
  hoursCount = 24,
}) => {
  const isClient = useIsClient();
  const chartData = data.slice(0, hoursCount);

  if (!isClient) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
        Loading particulate comparison chart...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Particulate Matter Dynamics (PM2.5 vs PM10)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Comparing fine respirable particles vs coarse dust against India NAAQS 24-hour limits
        </p>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="formattedTime" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />

            {/* NAAQS Standard Benchmarks */}
            <ReferenceLine
              y={60}
              stroke="#EA580C"
              strokeDasharray="4 4"
              label={{ value: 'PM2.5 Safe Limit (60)', fill: '#EA580C', fontSize: 10, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              y={100}
              stroke="#2563EB"
              strokeDasharray="4 4"
              label={{ value: 'PM10 Safe Limit (100)', fill: '#2563EB', fontSize: 10, position: 'insideTopLeft' }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as HourlyAqiPoint;
                  return (
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">{pt.formattedTime}</div>
                      <div className="text-orange-600 dark:text-orange-400 font-semibold">
                        PM2.5: {pt.pm2_5} µg/m³
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">
                        PM10: {pt.pm10} µg/m³
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend verticalAlign="top" height={36} iconType="circle" />

            <Line
              type="monotone"
              name="PM2.5 (Fine Particulates)"
              dataKey="pm2_5"
              stroke="#EA580C"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              name="PM10 (Coarse Dust)"
              dataKey="pm10"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
