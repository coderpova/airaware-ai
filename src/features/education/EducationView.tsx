'use client';

import React, { useState } from 'react';
import { CPCB_CATEGORIES } from '@/constants/breakpoints';
import { AqiCategory } from '@/types/aqi';
import {
  BookOpen,
  Activity,
  Layers,
  Eye,
  CheckCircle,
} from 'lucide-react';

export const EducationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aqi' | 'particulates' | 'reading_charts' | 'actions'>('aqi');
  const categories = Object.keys(CPCB_CATEGORIES) as AqiCategory[];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen size={14} />
          <span>Educational Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Understand Your Air
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Demystifying urban air pollution metrics, particulate sciences, and practical public health guidelines based on Indian CPCB standards.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 max-w-xl mx-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('aqi')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'aqi'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          What is AQI?
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('particulates')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'particulates'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          PM2.5 vs PM10
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reading_charts')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'reading_charts'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Reading Charts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'actions'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Citizen Actions
        </button>
      </div>

      {/* Tab 1: What is AQI */}
      {activeTab === 'aqi' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              What Does the Air Quality Index (AQI) Actually Measure?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Think of the Air Quality Index (AQI) as a thermometer running from <strong>0 to 500</strong>. Instead of temperature, it gauges the concentration of harmful air pollutants in the surrounding air. In India, the National AQI developed by the Central Pollution Control Board (CPCB) condenses complex scientific measurements of multiple gaseous and particulate pollutants into one simple number, a category name, and an intuitive color code.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  How Overall AQI is Calculated
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Each pollutant has its own sub-index based on its concentration over a prescribed averaging period (24 hours for particulates and SO2/NO2, 8 hours for CO and Ozone). The overall AQI is equal to the <strong>maximum sub-index</strong> among all monitored parameters. This highest sub-index pollutant is known as the <em>Dominant Pollutant</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  The Minimum Data Criteria
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Under official CPCB guidelines, declaring an official station AQI requires at least <strong>3 pollutants</strong>, one of which <strong>must be PM2.5 or PM10</strong>. When data comes from satellite and numerical weather models, AirAware AI explicitly labels it as a CPCB-inspired estimate to preserve scientific integrity.
                </p>
              </div>
            </div>
          </div>

          {/* CPCB Scale Breakdown Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              The 6 Official CPCB Categories & Public Health Benchmarks
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">AQI Range</th>
                    <th className="py-2.5 px-3">General Description</th>
                    <th className="py-2.5 px-3">Associated Health Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories.map((catKey) => {
                    const c = CPCB_CATEGORIES[catKey];
                    return (
                      <tr key={catKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px]"
                            style={{
                              backgroundColor: `${c.color}20`,
                              color: c.color,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {c.range[0]} – {c.range[1]}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {c.description}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {c.healthStatement}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PM2.5 vs PM10 */}
      {activeTab === 'particulates' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Understanding the Difference: PM2.5 vs PM10
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Particulate Matter (PM) consists of tiny solid bits or liquid droplets suspended in the air. The number indicates their maximum aerodynamic diameter in microns (µm). A human hair is roughly 50 to 70 microns thick.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
              {/* PM2.5 Card */}
              <div className="p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-orange-900 dark:text-orange-200">
                    PM2.5 (Fine Respirable Particles)
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                    &lt; 2.5 µm
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Approximately 1/30th the diameter of a strand of human hair. Produced mainly by vehicular diesel exhaust, thermal power plants, crop stubble burning, and secondary chemical gas reactions.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-800 text-xs space-y-1">
                  <strong className="block text-slate-900 dark:text-white">
                    Biological Impact:
                  </strong>
                  <p className="text-slate-500 dark:text-slate-400">
                    Because they are so fine, they evade nasal hairs and mucous traps, penetrating directly into lung alveoli and passing into systemic blood vessels. Linked to coronary heart disease, stroke, and chronic asthma.
                  </p>
                </div>
              </div>

              {/* PM10 Card */}
              <div className="p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-blue-900 dark:text-blue-200">
                    PM10 (Inhalable Coarse Dust)
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    &lt; 10 µm
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Larger dust grains, pollen, stone crushing dust, and construction debris. Often kicked up by moving vehicular traffic on unpaved roads and urban demolition works.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                  <strong className="block text-slate-900 dark:text-white">
                    Biological Impact:
                  </strong>
                  <p className="text-slate-500 dark:text-slate-400">
                    Deposits principally in the upper respiratory tract, nasal passages, and throat. Triggers acute coughing fits, burning eyes, sneezing, and bronchial irritation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reading Charts */}
      {activeTab === 'reading_charts' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              How to Read Urban Air Quality Charts
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Air quality is never completely static — it experiences dramatic diurnal (daily) cycles driven by human commute hours, weather temperature inversions, and solar radiation.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    1. Morning & Evening Inversion Peaks
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Notice how particulate charts routinely spike between 6 AM - 9 AM and 8 PM - 11 PM. During colder hours, a layer of warm air traps cooler polluted air near the ground (thermal inversion), preventing smoke and exhaust from dispersing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 shrink-0">
                  <Eye size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    2. Midday Atmospheric Mixing
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Between 12:00 PM and 4:00 PM, solar radiation heats the Earth&apos;s surface, causing vertical convection currents that lift and dilute ground-level pollutants. This is often the cleanest window for necessary outdoor errands in winter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    3. Rolling Averages vs Instantaneous Spikes
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    CPCB sub-indices use 24-hour averages for particulates to reflect chronic biological exposure, whereas instant hourly charts show acute spikes. Both are vital: the 24-hour average dictates overall legal categories, while hourly curves help you plan your workout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Citizen Actions */}
      {activeTab === 'actions' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Actionable Citizen Exposure Mitigation Checklist
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              While systemic policy and industrial reforms are fundamental to solving urban pollution, individual citizens can make evidence-backed choices to significantly cut their personal exposure.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Choose True N95 / FFP2 Respirators</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Cloth face masks and standard surgical masks only stop large spit droplets; they leak fine PM2.5 around the edges. Certified N95 respirators capture 95% of 0.3-micron particles when sealed tightly over the bridge of the nose.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Indoor HEPA Air Purifiers</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Keep windows sealed during winter inversions. Run a mechanical True HEPA air purifier sized appropriately for your room volume (CADR rating), and avoid burning incense or mosquito coils indoors.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Commute with Recirculated Cabin Air</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  When driving or riding in cabs in heavy traffic, ensure vehicle windows are up and set the climate control to internal air recirculation mode to avoid drawing diesel soot straight into the cabin.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Time Your Exercise with Clean Windows</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Never do intense aerobic sprinting or cycling at 6:00 AM on foggy winter mornings. Check AirAware AI forecast windows and shift heavy exercise to 12 PM - 3 PM or exercise inside a filtered room.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
