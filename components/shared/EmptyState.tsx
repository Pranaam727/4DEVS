import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Verified Data Available',
  message = 'Official verified data has not yet been published or retrieved for this metric.',
  actionText,
  onAction,
  icon,
  className = 'py-12',
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
    >
      <div className="w-12 h-12 max-w-[48px] max-h-[48px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 object-contain mb-3">
        {icon || (
          <svg
            className="w-6 h-6 max-w-[24px] max-h-[24px] object-contain"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h4>

      <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {message}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
