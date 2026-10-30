import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'auto',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const actualRatio = (value / max) * 100;

  // Determine color based on threshold or explicit variant
  let barColor = 'bg-brand-500';
  if (variant === 'auto') {
    if (actualRatio > 100) {
      barColor = 'bg-rose-600';
    } else if (actualRatio >= 85) {
      barColor = 'bg-amber-500';
    } else {
      barColor = 'bg-emerald-500';
    }
  } else if (variant === 'primary') {
    barColor = 'bg-brand-500';
  } else if (variant === 'success') {
    barColor = 'bg-emerald-500';
  } else if (variant === 'warning') {
    barColor = 'bg-amber-500';
  } else if (variant === 'danger') {
    barColor = 'bg-rose-600';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className={actualRatio > 100 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
              {actualRatio.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress bar'}
        className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightClasses}`}
      >
        <div
          className={`${heightClasses} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
