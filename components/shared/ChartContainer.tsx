import React from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  footerNote?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = '',
  minHeight = 'min-h-[320px]',
  footerNote,
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {actions}
            </div>
          )}
        </div>

        <div className={`w-full ${minHeight} flex flex-col justify-center`}>
          {children}
        </div>
      </div>

      {footerNote && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>{footerNote}</span>
        </div>
      )}
    </div>
  );
};
