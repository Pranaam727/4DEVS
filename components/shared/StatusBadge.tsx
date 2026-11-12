import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'info' | 'neutral' | 'error';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
  neutral: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
  error: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

const dotColors: Record<StatusVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-500',
  error: 'bg-rose-500',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  className = '',
  pulse = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${
          pulse ? 'animate-ping' : ''
        }`}
      />
      {label}
    </span>
  );
};
