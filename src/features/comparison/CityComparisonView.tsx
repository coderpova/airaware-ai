'use client';

import React, { useState, useEffect } from 'react';
import { AirQualityResponse } from '@/types/api';
import { QUICK_CITIES } from '@/constants/cities';
import { fetchCityAirQuality } from '@/lib/api/client';
import { SavedLocation } from '@/types/user';
import { AqiBadge } from '@/components/ui/AqiBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Columns, Loader2, ShieldCheck } from 'lucide-react';

export const CityComparisonView: React.FC = () => {
  const [city1, setCity1] = useState<SavedLocation>(QUICK_CITIES[0]); // Delhi
  const [city2, setCity2] = useState<SavedLocation>(QUICK_CITIES[4]); // Bengaluru
  const [city3, setCity3] = useState<SavedLocation | null>(QUICK_CITIES[3]); // Mumbai

  const [data1, setData1] = useState<AirQualityResponse | null>(null);
  const [data2, setData2] = useState<AirQualityResponse | null>(null);
  const [data3, setData3] = useState<AirQualityResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const [r1, r2, r3] = await Promise.all([
          fetchCityAirQuality(city1, controller.signal),
          fetchCityAirQuality(city2, controller.signal),
          city3 ? fetchCityAirQuality(city3, controller.signal) : Promise.resolve(null),
        ]);

        if (!controller.signal.aborted) {
          setData1(r1);
          setData2(r2);
          setData3(r3);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Error fetching comparison data', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      controller.abort();
    };
  }, [city1, city2, city3]);

  const citiesToDisplay = [
    { loc: city1, data: data1 },
    { loc: city2, data: data2 },
    ...(city3 ? [{ loc: city3, data: data3 }] : []),
  ];

  // Chart dataset
  const chartData = citiesToDisplay
    .filter((item) => item.data !== null)
    .map((item) => {
      const pm25 = item.data?.current.pollutants.find((p) => p.id === 'pm2_5')?.displayConcentration ?? 0;
      const pm10 = item.data?.current.pollutants.find((p) => p.id === 'pm10')?.displayConcentration ?? 0;
      return {
        name: item.loc.name,
        AQI: item.data?.current.cpcb.aqi ?? 0,
        'PM2.5': pm25,
        'PM10': pm10,
      };
    });

  // Identify cleaner city
  let cleanerCity = '';
  if (data1 && data2) {
    cleanerCity = data1.current.cpcb.aqi < data2.current.cpcb.aqi ? city1.name : city2.name;
    if (data3 && city3 && data3.current.cpcb.aqi < Math.min(data1.current.cpcb.aqi, data2.current.cpcb.aqi)) {
      cleanerCity = city3.name;
    }
  }

  return (
    <div className="space-y-6">
      {/* City Selectors */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Columns size={20} className="text-emerald-600" />
            Select Cities to Compare
          </h3>
          <p className="text-xs text-slate-500">
            Compare live atmospheric chemistry, particulate burdens, and health advisories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="compare-city-1" className="block text-xs font-bold text-slate-500 mb-1">
              City 1
            </label>
            <select
              id="compare-city-1"
              value={city1.id}
              onChange={(e) => {
                const found = QUICK_CITIES.find((c) => c.id === e.target.value);
                if (found) setCity1(found);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            >
              {QUICK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.admin1})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compare-city-2" className="block text-xs font-bold text-slate-500 mb-1">
              City 2
            </label>
            <select
              id="compare-city-2"
              value={city2.id}
              onChange={(e) => {
                const found = QUICK_CITIES.find((c) => c.id === e.target.value);
                if (found) setCity2(found);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            >
              {QUICK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.admin1})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compare-city-3" className="block text-xs font-bold text-slate-500 mb-1">
              City 3 (Optional)
            </label>
            <select
              id="compare-city-3"
              value={city3?.id || 'none'}
              onChange={(e) => {
                if (e.target.value === 'none') {
                  setCity3(null);
                } else {
                  const found = QUICK_CITIES.find((c) => c.id === e.target.value);
                  if (found) setCity3(found);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            >
              <option value="none">-- None --</option>
              {QUICK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.admin1})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Fetching multi-city atmospheric simulations...</span>
        </div>
      ) : (
        <>
          {/* Winner / Cleaner Banner */}
          {cleanerCity && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>{cleanerCity}</strong> currently exhibits the lowest overall air quality index among selected locations.
                </span>
              </div>
            </div>
          )}

          {/* Comparative Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {citiesToDisplay.map((item, idx) => {
              if (!item.data) return null;
              const cpcb = item.data.current.cpcb;
              const pm25 = item.data.current.pollutants.find((p) => p.id === 'pm2_5');
              const pm10 = item.data.current.pollutants.find((p) => p.id === 'pm10');

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {item.loc.name}
                      </h4>
                      <p className="text-xs text-slate-500">{item.loc.admin1}</p>
                    </div>
                    <AqiBadge category={cpcb.category} aqi={cpcb.aqi} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-500">CPCB AQI:</span>
                      <strong className="text-slate-900 dark:text-white text-base">
                        {cpcb.aqi}
                      </strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-500">PM2.5 (Fine):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {pm25?.displayConcentration} µg/m³
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-500">PM10 (Dust):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {pm10?.displayConcentration} µg/m³
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="text-slate-500">Dominant Pollutant:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {cpcb.dominantPollutantName || 'PM2.5'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Outdoor Advice:</span>
                      <span className="text-right text-slate-700 dark:text-slate-300 font-medium">
                        {cpcb.category === 'Good' || cpcb.category === 'Satisfactory'
                          ? 'Safe for sports'
                          : cpcb.category === 'Moderately Polluted'
                          ? 'Moderate intensity'
                          : 'Limit outdoor stay'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparative Bar Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Comparative Atmospheric Burden Chart
            </h4>
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AQI" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="PM2.5" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="PM10" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
