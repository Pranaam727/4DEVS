import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  statusCode?: number | string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Energy Intelligence Data',
  message = 'An unexpected error occurred while communicating with the data service.',
  onRetry,
  className = 'py-16',
  statusCode,
}) => {
  return (
    <div
      className={`rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 max-w-[48px] max-h-[48px] rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 object-contain mb-4">
        <svg
          className="w-6 h-6 max-w-[24px] max-h-[24px] object-contain"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md">
        {message}
      </p>

      {statusCode && (
        <span className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          Status Code: {statusCode}
        </span>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};
