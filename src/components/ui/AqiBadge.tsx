import React from 'react';
import { AqiCategory } from '@/types/aqi';
import { getCategoryInfo } from '@/lib/aqi/cpcb-calculator';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AqiBadgeProps {
  category: AqiCategory;
  aqi?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({
  category,
  aqi,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const info = getCategoryInfo(category);

  const getIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    switch (category) {
      case 'Good':
        return <ShieldCheck className="shrink-0" size={iconSize} aria-hidden="true" />;
      case 'Satisfactory':
        return <CheckCircle2 className="shrink-0" size={iconSize} aria-hidden="true" />;
      case 'Moderately Polluted':
        return <AlertTriangle className="shrink-0" size={iconSize} aria-hidden="true" />;
      case 'Poor':
        return <AlertCircle className="shrink-0" size={iconSize} aria-hidden="true" />;
      case 'Very Poor':
        return <AlertOctagon className="shrink-0" size={iconSize} aria-hidden="true" />;
      case 'Severe':
        return <ShieldAlert className="shrink-0" size={iconSize} aria-hidden="true" />;
      default:
        return <ShieldCheck className="shrink-0" size={iconSize} aria-hidden="true" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1 gap-2 font-semibold',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors',
        info.badgeBg,
        info.badgeText,
        info.borderLight,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Air Quality Status: ${category}${aqi !== undefined && aqi !== null ? `, AQI ${aqi}` : ''}`}
    >
      {showIcon && getIcon()}
      <span>
        {category}
        {aqi !== undefined && aqi !== null && ` • ${aqi}`}
      </span>
    </span>
  );
};
