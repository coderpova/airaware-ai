'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ExternalLink, ShieldCheck } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '@/lib/ai/insight-engine';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Compass size={18} />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                AirAware AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Understand Your Air. Protect Your Tomorrow. An explainable urban air quality intelligence
              platform empowering citizens, commuters, students, and vulnerable populations with actionable
              environmental insights.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <ShieldCheck size={14} className="text-emerald-500" />
                CPCB Breakpoints & Multi-parameter Sub-index Interpolation
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  48-Hour Forecast
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  AI Health Assistant
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  City Comparison
                </Link>
              </li>
              <li>
                <Link href="/education" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Understand Air (CPCB Guide)
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Scientific References */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Data & Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://airquality.cpcb.gov.in/ccr_docs/About_AQI.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  CPCB AQI Technical Guide
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Open-Meteo Air Quality
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <span className="text-slate-500">
                  Model: Copernicus CAMS & Atmospheric Dispersion
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  License: Open Data / MIT
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Health Disclaimer Box */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
            {MEDICAL_DISCLAIMER}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© 2026 AirAware AI. Built for Challenge 6: Urban Air Quality Assistant.</p>
            <p>Strictly No Fabricated Readings • Transparent Model Estimates</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
