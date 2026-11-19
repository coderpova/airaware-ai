'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QUICK_CITIES } from '@/constants/cities';
import { GeocodingResult } from '@/types/api';
import { SavedLocation } from '@/types/user';
import { Search, MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';

interface QuickCitySelectorProps {
  currentLocation: SavedLocation;
  onSelectLocation: (loc: SavedLocation) => void;
  isLoading?: boolean;
}

export const QuickCitySelector: React.FC<QuickCitySelectorProps> = ({
  currentLocation,
  onSelectLocation,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) throw new Error('Failed to find matching locations');
        const data = await res.json();
        setSearchResults(data.results || []);
        setDropdownOpen(true);
      } catch {
        setSearchError('Error searching location. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const visibleSearchResults = query.trim().length >= 2 ? searchResults : [];

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your current browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userLoc: SavedLocation = {
          id: 'user-current-location',
          name: 'My Current Location',
          admin1: 'GPS Coordinates',
          country: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        onSelectLocation(userLoc);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please select a city manually.';
        }
        alert(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Bar + Geolocation Button */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => {
                if (visibleSearchResults.length > 0) setDropdownOpen(true);
              }}
              placeholder="Search Indian city, sector, or district..."
              aria-label="Search city or locality"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            />
            {isSearching && (
              <Loader2
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
              />
            )}
          </div>

          {/* Search Results Dropdown */}
          {dropdownOpen && (visibleSearchResults.length > 0 || searchError) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
              {searchError ? (
                <div className="p-3 text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{searchError}</span>
                </div>
              ) : (
                visibleSearchResults.map((result) => (
                  <button
                    key={`${result.id}-${result.latitude}-${result.longitude}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        id: String(result.id),
                        name: result.name,
                        admin1: result.admin1,
                        country: result.country || '',
                        latitude: result.latitude,
                        longitude: result.longitude,
                      });
                      setQuery('');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800/50 last:border-0 flex items-start gap-2.5 transition-colors focus:bg-slate-50 focus:outline-none"
                  >
                    <MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {result.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {[result.admin1, result.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* GPS Geolocation Button */}
        <button
          type="button"
          onClick={handleUseGeolocation}
          disabled={isLocating || isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        >
          {isLocating ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <Navigation size={16} className="text-emerald-600" />}
          <span>Use My GPS</span>
        </button>
      </div>

      {/* Quick Access City Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Quick Access:
        </span>
        {QUICK_CITIES.map((city) => {
          const isSelected =
            currentLocation.name.toLowerCase() === city.name.toLowerCase() &&
            Math.abs(currentLocation.latitude - city.latitude) < 0.1;

          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectLocation(city)}
              disabled={isLoading}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
