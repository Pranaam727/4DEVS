import React from 'react';

export interface MetricCardProps {
  title: string;
  value: number | string | null | undefined;
  unit?: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'emerald' | 'amber' | 'sky' | 'slate' | 'violet';
  icon?: React.ReactNode;
  footnote?: string;
  isLoading?: boolean;
}

const colorMap = {
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    highlight: 'text-emerald-600 dark:text-emerald-400',
    ring: 'focus:ring-emerald-500',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-500/50',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    highlight: 'text-amber-600 dark:text-amber-400',
    ring: 'focus:ring-amber-500',
  },
  sky: {
    border: 'border-sky-500/30 hover:border-sky-500/50',
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    highlight: 'text-sky-600 dark:text-sky-400',
    ring: 'focus:ring-sky-500',
  },
  slate: {
    border: 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700',
    iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    highlight: 'text-slate-700 dark:text-slate-300',
    ring: 'focus:ring-slate-500',
  },
  violet: {
    border: 'border-purple-500/30 hover:border-purple-500/50',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    highlight: 'text-purple-600 dark:text-purple-400',
    ring: 'focus:ring-purple-500',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  trend,
  accentColor = 'slate',
  icon,
  footnote,
  isLoading = false,
}) => {
  const styles = colorMap[accentColor];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      </div>
    );
  }

  const isUnavailable = value === null || value === undefined;

  return (
    <div
      className={`relative rounded-xl border bg-white dark:bg-slate-900/70 p-5 shadow-xs transition-all duration-200 ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {icon && (
          <div className={`p-2 rounded-lg shrink-0 ${styles.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {isUnavailable ? (
          <span className="text-xl font-bold text-slate-400 dark:text-slate-500 italic">
            Not Reported
          </span>
        ) : (
          <>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
          {subtitle}
        </p>
      )}

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={
              trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }
          >
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-slate-500 dark:text-slate-400">
              {trend.label}
            </span>
          )}
        </div>
      )}

      {footnote && (
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
          {footnote}
        </p>
      )}
    </div>
  );
};
