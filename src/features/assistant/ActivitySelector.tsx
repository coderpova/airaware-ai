import React from 'react';
import { UserActivity } from '@/types/user';
import { Footprints, Flame, Bike, Trophy, GraduationCap, Car } from 'lucide-react';

interface ActivitySelectorProps {
  selected: UserActivity;
  onSelect: (activity: UserActivity) => void;
}

interface ActivityOption {
  id: UserActivity;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ACTIVITIES: ActivityOption[] = [
  {
    id: 'walking',
    label: 'Walking',
    description: 'Brisk walks, errands, and casual strolls',
    icon: <Footprints size={20} />,
  },
  {
    id: 'running',
    label: 'Running / Jogging',
    description: 'High-ventilation aerobic cardiovascular running',
    icon: <Flame size={20} />,
  },
  {
    id: 'cycling',
    label: 'Cycling',
    description: 'Road cycling, commutes, and endurance rides',
    icon: <Bike size={20} />,
  },
  {
    id: 'outdoor_sports',
    label: 'Outdoor Sports',
    description: 'Football, cricket, tennis, and athletics',
    icon: <Trophy size={20} />,
  },
  {
    id: 'school_commute',
    label: 'School Commute',
    description: 'Children going to school, recess, and bus stops',
    icon: <GraduationCap size={20} />,
  },
  {
    id: 'daily_commuting',
    label: 'Daily Commute',
    description: 'Office transit on metro, 2-wheelers, buses, and cars',
    icon: <Car size={20} />,
  },
];

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Choose Your Planned Activity
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ACTIVITIES.map((act) => {
          const isSelected = selected === act.id;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelect(act.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }
                >
                  {act.icon}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">{act.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {act.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
