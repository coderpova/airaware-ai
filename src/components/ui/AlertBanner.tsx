import React from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'danger';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'warning',
  title,
  message,
  onDismiss,
  className,
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
      icon: <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={18} aria-hidden="true" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" size={18} aria-hidden="true" />,
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
      icon: <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={18} aria-hidden="true" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-3 p-4 rounded-xl border text-sm transition-all',
        current.bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{current.icon}</div>
        <div>
          {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
          <p className="leading-relaxed opacity-95">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss alert"
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
