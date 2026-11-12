'use client';

import React from 'react';
import { ChartContainer } from '@/components/shared/ChartContainer';
import { EmptyState } from '@/components/shared/EmptyState';
import type { CoalVsRenewableComparison } from '@/lib/types/energy-mix';

interface CoalVsRenewableChartProps {
  data: CoalVsRenewableComparison;
}

interface CompareBarProps {
  leftLabel: string;
  leftValue: number;
  leftPercent: number;
  rightLabel: string;
  rightValue: number;
  rightPercent: number;
  unit: string;
  metric: string;
  leftColor: string;
  rightColor: string;
}

const CompareBar: React.FC<CompareBarProps> = ({
  leftLabel,
  leftValue,
  leftPercent,
  rightLabel,
  rightValue,
  rightPercent,
  unit,
  metric,
  leftColor,
  rightColor,
}) => {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
        <span>{metric}</span>
        <span className="font-mono text-slate-500">({unit})</span>
      </div>
      <div className="flex gap-1 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div
          style={{ width: `${leftPercent}%`, backgroundColor: leftColor }}
          className="flex items-center justify-center transition-all duration-700 opacity-80"
          title={`${leftLabel}: ${leftValue.toLocaleString('en-IN')} ${unit} (${leftPercent.toFixed(1)}%)`}
        >
          {leftPercent > 12 && (
            <span className="text-[10px] font-bold text-white truncate px-1">
              {leftPercent.toFixed(0)}%
            </span>
          )}
        </div>
        <div
          style={{ width: `${rightPercent}%`, backgroundColor: rightColor }}
          className="flex items-center justify-center transition-all duration-700 opacity-80"
          title={`${rightLabel}: ${rightValue.toLocaleString('en-IN')} ${unit} (${rightPercent.toFixed(1)}%)`}
        >
          {rightPercent > 12 && (
            <span className="text-[10px] font-bold text-white truncate px-1">
              {rightPercent.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs mt-1.5 text-slate-600 dark:text-slate-400">
        <span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {leftValue.toLocaleString('en-IN')}
          </span>{' '}
          {unit} — {leftLabel}
        </span>
        <span>
          {rightLabel} —{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {rightValue.toLocaleString('en-IN')}
          </span>{' '}
          {unit}
        </span>
      </div>
    </div>
  );
};

export const CoalVsRenewableChart: React.FC<CoalVsRenewableChartProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <ChartContainer title="Coal vs Renewable Comparison">
        <EmptyState
          title="Comparison Data Not Available"
          message="Coal vs renewable comparison data is currently unavailable."
        />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Coal vs Renewable — Side-by-Side Comparison"
      subtitle="Installed capacity and electricity generation comparison"
      footerNote="Source: CEA Monthly Reports. Renewable = Solar + Wind + Hydro + Bio. Coal = pit-head + imported."
    >
      <div className="space-y-6 mt-2">
        {/* Legend */}
        <div className="flex gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-500 opacity-80" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Coal / Conventional</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 opacity-80" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Renewable Energy</span>
          </div>
        </div>

        {/* Capacity bar */}
        <CompareBar
          leftLabel="Coal"
          leftValue={data.coalCapacity}
          leftPercent={data.coalCapacitySharePercent}
          rightLabel="Renewable"
          rightValue={data.renewableCapacity}
          rightPercent={data.renewableCapacitySharePercent}
          unit={data.capacityUnit}
          metric="Installed Capacity"
          leftColor="#64748b"
          rightColor="#10b981"
        />

        {/* Generation bar — only if available */}
        {data.coalGeneration !== undefined &&
          data.renewableGeneration !== undefined &&
          data.coalGenerationSharePercent !== undefined &&
          data.renewableGenerationSharePercent !== undefined &&
          data.generationUnit && (
            <CompareBar
              leftLabel="Coal"
              leftValue={data.coalGeneration}
              leftPercent={data.coalGenerationSharePercent}
              rightLabel="Renewable"
              rightValue={data.renewableGeneration}
              rightPercent={data.renewableGenerationSharePercent}
              unit={data.generationUnit}
              metric="Electricity Generation"
              leftColor="#64748b"
              rightColor="#10b981"
            />
          )}

        {/* Quick ratio callout */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-3 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Coal Capacity Share</div>
            <div className="text-xl font-extrabold text-slate-700 dark:text-slate-200">
              {data.coalCapacitySharePercent.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50 p-3 text-center">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-0.5">Renewable Capacity Share</div>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {data.renewableCapacitySharePercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </ChartContainer>
  );
};
