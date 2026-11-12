import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  category?: string;
  logo?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  category,
  logo,
  icon,
}) => {
  const displayLogo = logo || icon;

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          {displayLogo && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 max-w-[200px] max-h-[200px] rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 p-2.5 shadow-xs object-contain">
              <div className="w-full h-full flex items-center justify-center object-contain max-w-[200px] max-h-[200px]">
                {displayLogo}
              </div>
            </div>
          )}
          <div>
            {category && (
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                {category}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h1>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
