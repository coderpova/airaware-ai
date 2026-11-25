'use client';

import React, { useEffect } from 'react';
import { CpcbCalculationResult } from '@/types/aqi';
import { X, ExternalLink, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AqiMethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cpcb: CpcbCalculationResult;
  coveragePercent: number;
}

export const AqiMethodologyDrawer: React.FC<AqiMethodologyDrawerProps> = ({
  isOpen,
  onClose,
  cpcb,
  coveragePercent,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={22} />
              <h3 id="methodology-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                CPCB AQI Calculation Methodology
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Indian National Air Quality Index (NAQI) Standards & Estimation Protocols
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 text-sm text-slate-600 dark:text-slate-300">
          {/* Compliance & Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              cpcb.isCpcbCompliant
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-200'
            }`}
          >
            {cpcb.isCpcbCompliant ? (
              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            ) : (
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {cpcb.isCpcbCompliant ? 'Compliant Parameter Coverage' : 'CPCB-Inspired Model Estimate'}
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed">
                {cpcb.methodologyNotes}
              </p>
            </div>
          </div>

          {/* Sub-Index Interpolation Formula */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
              1. Mathematical Sub-Index Formula
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-2">
              For each pollutant, the sub-index <em>I<sub>p</sub></em> is calculated using linear interpolation between official breakpoint ranges:
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
              Ip = [ (I_HI - I_LO) / (B_HI - B_LO) ] × (Cp - B_LO) + I_LO
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Where B_HI and B_LO are pollutant concentration breakpoints and I_HI and I_LO are the corresponding AQI scale values.
            </p>
          </div>

          {/* CPCB Station Rules */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
              2. Official CPCB Station Requirements
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong>Minimum 3 Pollutants:</strong> Official station AQI requires at least three pollutants to be actively monitored.
              </li>
              <li>
                <strong>Mandatory Particulates:</strong> At least one particulate matter parameter (PM2.5 or PM10) must be present.
              </li>
              <li>
                <strong>Overall AQI Rule:</strong> Overall AQI is dictated by the maximum sub-index (dominant pollutant):{' '}
                <span className="font-mono">AQI = max(I₁, I₂, …, Iₙ)</span>.
              </li>
              <li>
                <strong>Averaging Periods:</strong> PM10, PM2.5, NO₂, SO₂ use 24-hour averages; CO and O₃ use 8-hour averages.
              </li>
            </ul>
          </div>

          {/* Transparent Model Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>Model Dispersion Data vs Ground CAAQMS Stations</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AirAware AI calculates these sub-indices using high-resolution numerical atmospheric chemistry and dispersion forecasts provided by Open-Meteo (Copernicus CAMS). While this allows comprehensive coverage for any neighborhood or suburb without an expensive physical monitoring tower, it is explicitly classified as an <strong>atmospheric model estimate</strong> rather than an official CAAQMS station sensor reading.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Data Coverage: {coveragePercent}% of core parameters</span>
              <span>Calculated At: {new Date(cpcb.calculatedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Official Documentation Link */}
          <div className="pt-2">
            <a
              href="https://airquality.cpcb.gov.in/ccr_docs/About_AQI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Download Official CPCB National Air Quality Index Technical PDF</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
