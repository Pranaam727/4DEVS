import React from 'react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Retrieving energy intelligence data...',
  submessage = 'Connecting to official data endpoints',
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {message}
      </h3>
      {submessage && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {submessage}
        </p>
      )}
    </div>
  );
};
