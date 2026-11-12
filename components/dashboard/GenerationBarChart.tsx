'use client';

import React from 'react';
import { ChartContainer } from '@/components/shared/ChartContainer';
import { EmptyState } from '@/components/shared/EmptyState';
import type { FuelCategoryBreakdown } from '@/lib/types/energy-mix';

interface GenerationBarChartProps {
  breakdown: FuelCategoryBreakdown[];
  unit: string;
  reportingPeriod: string;
}

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
    ['#10b981', '#6366f1', '#3b82f6', '#f59e0b', '#ef4444'][idx % 5]
  );
}

export const GenerationBarChart: React.FC<GenerationBarChartProps> = ({
  breakdown,
  unit,
  reportingPeriod,
}) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <ChartContainer title="Electricity Generation — Fuel Mix">
        <EmptyState
          title="Generation Breakdown Not Available"
          message="Fuel-wise generation data has not been reported for this period."
        />
      </ChartContainer>
    );
  }

  const maxValue = Math.max(...breakdown.map((b) => b.value));
  const sorted = [...breakdown].sort((a, b) => b.value - a.value);

  return (
    <ChartContainer
      title="Electricity Generation — Fuel Mix"
      subtitle={`Reporting Period: ${reportingPeriod}`}
      footerNote={`Units: ${unit} (Billion Units). Source: CEA / Grid-India`}
    >
      <div className="space-y-3 mt-2">
        {sorted.map((item, idx) => {
          const color = item.color || getColor(item.fuel, idx);
          const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={item.fuel} className="group">
              <div className="flex items-center justify-between mb-1 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.fuel}
                  </span>
                  {item.isRenewable && (
                    <span className="px-1 py-0.5 text-[10px] rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold leading-none">
                      RE
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  {item.value.toLocaleString('en-IN')} {unit}
                  <span className="ml-1.5 text-slate-400 font-normal">
                    ({item.sharePercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};
