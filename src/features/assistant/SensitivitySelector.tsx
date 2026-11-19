import React from 'react';
import { UserSensitivity } from '@/types/user';
import { Users, Baby, UserCheck, HeartPulse } from 'lucide-react';

interface SensitivitySelectorProps {
  selected: UserSensitivity;
  onSelect: (sensitivity: UserSensitivity) => void;
}

interface SensitivityOption {
  id: UserSensitivity;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SENSITIVITIES: SensitivityOption[] = [
  {
    id: 'general',
    label: 'General Population',
    description: 'Healthy adults with no diagnosed chronic pulmonary conditions',
    icon: <Users size={18} />,
  },
  {
    id: 'children',
    label: 'Children & Adolescents',
    description: 'Higher respiratory frequency and developing lung parenchyma',
    icon: <Baby size={18} />,
  },
  {
    id: 'older_adults',
    label: 'Older Adults (60+)',
    description: 'Higher susceptibility to arterial stress and blood pressure fluctuations',
    icon: <UserCheck size={18} />,
  },
  {
    id: 'respiratory_cardiac',
    label: 'Respiratory & Cardiac Sensitivity',
    description: 'Diagnosed asthma, COPD, bronchitis, hypertension, or heart disease',
    icon: <HeartPulse size={18} />,
  },
];

export const SensitivitySelector: React.FC<SensitivitySelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Select Health Vulnerability Profile
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SENSITIVITIES.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              aria-pressed={isSelected}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">{item.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
