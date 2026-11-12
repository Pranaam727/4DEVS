'use client';

import React from 'react';
import { ChartContainer } from '@/components/shared/ChartContainer';
import { EmptyState } from '@/components/shared/EmptyState';
import type { FuelCategoryBreakdown } from '@/lib/types/energy-mix';

interface CapacityPieChartProps {
  renewableTotal: number;
  conventionalTotal: number;
  unit: string;
  breakdown: FuelCategoryBreakdown[];
  rechartsAvailable: boolean;
}

/** Color palette — deterministic per fuel type */
const FUEL_COLORS: Record<string, string> = {
  Solar: '#10b981',
  Wind: '#6366f1',
  'Large Hydro': '#3b82f6',
  'Small Hydro': '#06b6d4',
  'Bio Power': '#84cc16',
  Nuclear: '#f59e0b',
  Gas: '#f97316',
  Diesel: '#ef4444',
  Coal: '#64748b',
  Lignite: '#78716c',
  Other: '#94a3b8',
};

function getColor(fuel: string, idx: number): string {
  return (
    FUEL_COLORS[fuel] ||
    ['#10b981', '#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#84cc16'][idx % 6]
  );
}

/** Simple SVG donut — no Recharts dependency needed for a lightweight ring chart */
function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; share: number; color: string }[];
}) {
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 24;

  let cumulative = 0;
  const total = segments.reduce((s, seg) => s + seg.share, 0);

  return (
    <div className="w-44 h-44 sm:w-48 sm:h-48 max-w-[200px] max-h-[200px] mx-auto flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 160 160"
        width="180"
        height="180"
        className="w-full h-full max-w-[200px] max-h-[200px] object-contain mx-auto"
        style={{ maxWidth: '200px', maxHeight: '200px' }}
      >
        {segments.map((seg, i) => {
          const pct = seg.share / total;
          const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
          const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2;
          cumulative += pct;

          const x1 = cx + radius * Math.cos(startAngle);
          const y1 = cy + radius * Math.sin(startAngle);
          const x2 = cx + radius * Math.cos(endAngle);
          const y2 = cy + radius * Math.sin(endAngle);
          const largeArc = pct > 0.5 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
            >
              <title>
                {seg.label}: {seg.value.toLocaleString('en-IN')} ({seg.share.toFixed(1)}%)
              </title>
            </path>
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" fontSize="10" fontWeight="700">
          Total
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-700 dark:fill-slate-300" fontSize="8">
          installed
        </text>
      </svg>
    </div>
  );
}

export const CapacityPieChart: React.FC<CapacityPieChartProps> = ({
  renewableTotal,
  conventionalTotal,
  unit,
  breakdown,
}) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <ChartContainer title="Installed Capacity Distribution">
        <EmptyState
          title="Fuel-wise Breakdown Not Available"
          message="Detailed fuel category breakdown has not been reported for this period."
        />
      </ChartContainer>
    );
  }

  const segments = breakdown.map((b, idx) => ({
    label: b.fuel,
    value: b.value,
    share: b.sharePercent,
    color: b.color || getColor(b.fuel, idx),
  }));

  return (
    <ChartContainer
      title="Installed Capacity — Fuel Mix"
      subtitle={`Renewable: ${renewableTotal.toLocaleString('en-IN')} ${unit} | Conventional: ${conventionalTotal.toLocaleString('en-IN')} ${unit}`}
      footerNote="Source: CEA Installed Capacity Report (All-India)"
    >
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="shrink-0 w-full sm:w-auto max-w-[200px] mx-auto flex items-center justify-center">
          <DonutChart segments={segments} />
        </div>
        <div className="flex-1 w-full grid grid-cols-1 gap-1.5">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{seg.label}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {seg.value.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500 ml-1">{unit}</span>
                <span className="text-slate-400 ml-1.5">({seg.share.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};
