'use client';

import React, { useState, useEffect } from 'react';
import { AirQualityMap } from '@/features/map/AirQualityMap';
import { MapLegend } from '@/features/map/MapLegend';
import { QUICK_CITIES } from '@/constants/cities';
import { SavedLocation } from '@/types/user';
import { AirQualityResponse } from '@/types/api';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';

interface CityMapItem {
  location: SavedLocation;
  aqi: number;
  pm2_5: number;
  pm10: number;
  dominant: string;
}

export default function MapPage() {
  const [citiesData, setCitiesData] = useState<CityMapItem[]>([]);
  const [selectedCity, setSelectedCity] = useState<SavedLocation>(QUICK_CITIES[0]);
  const [selectedCityDetails, setSelectedCityDetails] = useState<AirQualityResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load initial batch of quick cities
  useEffect(() => {
    async function loadCities() {
      try {
        const promises = QUICK_CITIES.map(async (city) => {
          try {
            const res = await fetch(
              `/api/air-quality?latitude=${city.latitude}&longitude=${city.longitude}&name=${encodeURIComponent(
                city.name
              )}`
            );
            if (!res.ok) return null;
            const data: AirQualityResponse = await res.json();
            const pm25 =
              data.current.pollutants.find((p) => p.id === 'pm2_5')?.displayConcentration ?? 0;
            const pm10 =
              data.current.pollutants.find((p) => p.id === 'pm10')?.displayConcentration ?? 0;
            return {
              location: city,
              aqi: data.current.cpcb.aqi,
              pm2_5: pm25,
              pm10,
              dominant: data.current.cpcb.dominantPollutantName || 'Particulates',
            } as CityMapItem;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(promises);
        const valid = results.filter((r): r is CityMapItem => r !== null);
        setCitiesData(valid);
      } catch (err) {
        console.error('Failed to load cities map data', err);
      }
    }

    loadCities();
  }, []);

  // Fetch full details when a city is selected
  useEffect(() => {
    async function loadDetails() {
      setLoadingDetails(true);
      try {
        const res = await fetch(
          `/api/air-quality?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}&name=${encodeURIComponent(
            selectedCity.name
          )}`
        );
        if (res.ok) {
          const data: AirQualityResponse = await res.json();
          setSelectedCityDetails(data);
        }
      } catch (err) {
        console.error('Failed to load city details', err);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadDetails();
  }, [selectedCity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MapPin className="text-emerald-600" size={28} />
            Interactive Urban Pollution Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore live atmospheric chemistry distributions and particulate burdens across Indian metropolitan regions.
          </p>
        </div>

        {/* Model Transparency Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span>Transparent model-grid simulation (Copernicus CAMS), not physical CAAQMS stations.</span>
        </div>
      </div>

      {/* Main Map View + Selected Location Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <AirQualityMap
            center={[selectedCity.latitude, selectedCity.longitude]}
            zoom={selectedCity.id === 'delhi' ? 7 : 8}
            citiesData={citiesData}
            selectedCity={selectedCity}
            onSelectCity={(loc) => setSelectedCity(loc)}
          />

          <MapLegend />
        </div>

        {/* Selected City Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inspected Location
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedCity.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedCity.admin1}</p>
              </div>

              {selectedCityDetails && (
                <AqiBadge
                  category={selectedCityDetails.current.cpcb.category}
                  aqi={selectedCityDetails.current.cpcb.aqi}
                  size="md"
                />
              )}
            </div>

            {loadingDetails ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
                <span>Loading location details...</span>
              </div>
            ) : selectedCityDetails ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Public Health Status:
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {selectedCityDetails.current.cpcb.methodologyNotes}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px]">PM2.5 (Fine)</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedCityDetails.current.pollutants.find((p) => p.id === 'pm2_5')?.displayConcentration} µg/m³
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[11px]">PM10 (Dust)</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedCityDetails.current.pollutants.find((p) => p.id === 'pm10')?.displayConcentration} µg/m³
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Dominant Pollutant:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    {selectedCityDetails.current.cpcb.dominantPollutantName || 'None identified'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    Select Another City:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_CITIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCity(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          selectedCity.id === c.id
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
