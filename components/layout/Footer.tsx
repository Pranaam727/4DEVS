'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                IG
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                INDIA GREEN GRID
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Renewable energy intelligence, compliance tracking, and clean-tech decision support for the Indian subcontinent.
            </p>
            <div className="mt-4 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Strict Zero-Demo-Data Policy Active
            </div>
          </div>

          {/* Intelligence Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/energy-mix" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Energy Mix & Capacity
                </Link>
              </li>
              <li>
                <Link href="/rpo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  RPO Compliance Tracker
                </Link>
              </li>
              <li>
                <Link href="/solar" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Rooftop Solar ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Verified Green Jobs Board
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Indian Sources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Primary Data Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://cea.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  CEA (Central Electricity Authority)
                </a>
              </li>
              <li>
                <a
                  href="https://mnre.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  MNRE (Ministry of New & Renewable Energy)
                </a>
              </li>
              <li>
                <a
                  href="https://posoco.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  Grid-India / POSOCO
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture / Integrity */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Data Integrity
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              All dashboard metrics are bound to verified official records. If a metric or period is unpublished, it is designated as unavailable rather than estimated with synthetic data.
            </p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              App Router &bull; TypeScript &bull; Recharts
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 India Green Grid. Open Energy Intelligence Initiative.</p>
          <p className="text-[11px]">Designed & Engineered for National Clean Energy Transition</p>
        </div>
      </div>
    </footer>
  );
};
