import React from 'react';
import { StatusBadge } from './StatusBadge';

interface SourceAttributionProps {
  source: string | null;
  sourceUrl?: string | null;
  asOf: string | null;
  retrievedAt: string | null;
  dataFreshness?: 'live' | 'recent' | 'historical' | 'outdated';
  className?: string;
  notes?: string[];
}

export const SourceAttribution: React.FC<SourceAttributionProps> = ({
  source,
  sourceUrl,
  asOf,
  retrievedAt,
  dataFreshness,
  className = '',
  notes,
}) => {
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Not recorded';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getFreshnessBadge = () => {
    switch (dataFreshness) {
      case 'live':
        return <StatusBadge label="Live Telemetry" variant="success" pulse />;
      case 'recent':
        return <StatusBadge label="Verified Periodic Report" variant="info" />;
      case 'historical':
        return <StatusBadge label="Archival Baseline" variant="neutral" />;
      case 'outdated':
        return <StatusBadge label="Data Age > 90 Days" variant="warning" />;
      default:
        return asOf ? (
          <StatusBadge label={`Official Data (As of ${asOf})`} variant="info" />
        ) : null;
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Data Provenance & Source Attribution
          </span>
          {getFreshnessBadge()}
        </div>
        <span className="text-[11px] text-slate-400">
          Strict Zero-Demo-Data Policy Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <span className="block text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            Primary Authority / Source
          </span>
          <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
            {sourceUrl && source ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                {source}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              source || 'Pending Official Data Ingestion'
            )}
          </div>
        </div>

        <div>
          <span className="block text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            Publication / As Of Period
          </span>
          <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
            {asOf || 'Unspecified by authority'}
          </span>
        </div>

        <div>
          <span className="block text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
            Last Backend Retrieval
          </span>
          <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
            {formatDateTime(retrievedAt)}
          </span>
        </div>
      </div>

      {notes && notes.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60">
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
            {notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
