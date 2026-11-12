'use client';

import React from 'react';
import { ChartContainer } from '@/components/shared/ChartContainer';
import { EmptyState } from '@/components/shared/EmptyState';
import type { HistoricalTrendPoint } from '@/lib/types/energy-mix';

interface HistoricalTrendChartProps {
  data: HistoricalTrendPoint[];
}

/**
 * Simple SVG line chart — no Recharts dependency.
 * Renders up to 3 trend lines: Renewable Capacity, Conventional Capacity, Renewable Generation.
 * Falls back gracefully if data points are missing.
 */
function SVGLineChart({
  points,
  series,
  width = 600,
  height = 220,
}: {
  points: HistoricalTrendPoint[];
  series: {
    key: keyof HistoricalTrendPoint;
    label: string;
    color: string;
  }[];
  width?: number;
  height?: number;
}) {
  const paddingLeft = 56;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 36;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Collect all numeric values across series
  const allValues: number[] = [];
  series.forEach(({ key }) => {
    points.forEach((p) => {
      const v = p[key];
      if (typeof v === 'number') allValues.push(v);
    });
  });

  if (allValues.length === 0) return null;

  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const xStep = points.length > 1 ? chartW / (points.length - 1) : chartW;
  const toX = (i: number) => paddingLeft + i * xStep;
  const toY = (val: number) =>
    paddingTop + chartH - ((val - minVal) / range) * chartH;

  // Y-axis ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    minVal + (range * i) / ticks
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-full h-auto text-[10px]"
      style={{ maxHeight: `${height}px` }}
      aria-label="Historical trend chart"
    >
      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = toY(tick);
        return (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 6}
              y={y + 3}
              textAnchor="end"
              fill="#94a3b8"
              fontSize="9"
            >
              {tick.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={toX(i)}
          y={height - 6}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
        >
          {p.period}
        </text>
      ))}

      {/* Series lines */}
      {series.map(({ key, color }) => {
        const coords = points
          .map((p, i) => {
            const v = p[key];
            if (typeof v !== 'number') return null;
            return { x: toX(i), y: toY(v) };
          })
          .filter(Boolean) as { x: number; y: number }[];

        if (coords.length < 2) return null;

        const d = coords
          .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
          .join(' ');

        return (
          <g key={key as string}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {coords.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer title="Historical Energy Trends" minHeight="min-h-[200px]">
        <EmptyState
          title="Historical Trend Data Not Available"
          message="Verified multi-year historical data has not been ingested yet. Only officially published year-on-year records will be displayed here."
        />
      </ChartContainer>
    );
  }

  const hasCapacity = data.some(
    (d) =>
      typeof d.renewableCapacity === 'number' ||
      typeof d.conventionalCapacity === 'number'
  );
  const hasGeneration = data.some(
    (d) => typeof d.renewableGeneration === 'number'
  );

  const capacitySeries = [
    { key: 'renewableCapacity' as keyof HistoricalTrendPoint, label: 'Renewable Capacity (GW)', color: '#10b981' },
    { key: 'conventionalCapacity' as keyof HistoricalTrendPoint, label: 'Conventional Capacity (GW)', color: '#64748b' },
  ];

  const generationSeries = [
    { key: 'renewableGeneration' as keyof HistoricalTrendPoint, label: 'Renewable Generation (BU)', color: '#6366f1' },
    { key: 'coalGeneration' as keyof HistoricalTrendPoint, label: 'Coal Generation (BU)', color: '#f59e0b' },
  ];

  return (
    <ChartContainer
      title="Historical Energy Trends"
      subtitle={`${data[0]?.period} – ${data[data.length - 1]?.period}`}
      footerNote="Source: CEA Annual Reports. Only verified year-on-year official data plotted."
    >
      <div className="space-y-6 mt-2">
        {hasCapacity && (
          <div>
            <div className="flex flex-wrap gap-4 text-xs mb-2">
              {capacitySeries.map((s) => (
                <div key={s.key as string} className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
            <SVGLineChart points={data} series={capacitySeries} />
          </div>
        )}

        {hasGeneration && (
          <div>
            <div className="flex flex-wrap gap-4 text-xs mb-2">
              {generationSeries.map((s) => (
                <div key={s.key as string} className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
            <SVGLineChart points={data} series={generationSeries} />
          </div>
        )}
      </div>
    </ChartContainer>
  );
};
