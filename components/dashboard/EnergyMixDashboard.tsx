'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { SourceAttribution } from '@/components/shared/SourceAttribution';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CapacityPieChart } from '@/components/dashboard/CapacityPieChart';
import { GenerationBarChart } from '@/components/dashboard/GenerationBarChart';
import { CoalVsRenewableChart } from '@/components/dashboard/CoalVsRenewableChart';
import { HistoricalTrendChart } from '@/components/dashboard/HistoricalTrendChart';
import type { EnergyMixResponse, EnergyMixPayload } from '@/lib/types/energy-mix';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export function EnergyMixDashboard() {
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [response, setResponse] = useState<EnergyMixResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setStatus('loading');
    setFetchError(null);
    try {
      const res = await fetch('/api/energy-mix', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json: EnergyMixResponse = await res.json();
      setResponse(json);
      setStatus('success');
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : 'Unknown network or server error'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Loading ----
  if (status === 'idle' || status === 'loading') {
    return (
      <LoadingState
        message="Retrieving India Energy Mix Data..."
        submessage="Connecting to CEA and MNRE official data endpoints"
        className="py-24"
      />
    );
  }

  // ---- Network/Server Error ----
  if (status === 'error') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Energy Mix Dashboard"
          category="National Energy Intelligence"
        />
        <ErrorState
          title="Failed to Retrieve Energy Data"
          message={fetchError || 'An unexpected error occurred while connecting to the data service.'}
          onRetry={fetchData}
          className="py-16"
        />
      </div>
    );
  }

  if (!response) return null;

  // ---- API-level Unavailable ----
  if (response.status === 'unavailable') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Energy Mix Dashboard"
          category="National Energy Intelligence"
          subtitle="All-India installed capacity, electricity generation, coal vs renewable comparison, and historical trends."
          badge={<StatusBadge label="Data Pending" variant="warning" />}
        />

        <EmptyState
          title="Official Energy Data Not Yet Available"
          message={response.message || 'The backend data ingestion pipeline has not yet connected to official CEA/MNRE data sources. This dashboard will populate automatically when real data is available.'}
          actionText="Retry Connection"
          onAction={fetchData}
          className="py-16"
        />

        {/* Show source attribution even for unavailable state */}
        <SourceAttribution
          source={response.source}
          sourceUrl={response.sourceUrl}
          asOf={response.asOf}
          retrievedAt={response.retrievedAt}
          notes={[
            'Strict Zero-Demo-Data Policy: no synthetic numbers will be substituted for missing official records.',
            'Member 2 (Backend Engineer) is responsible for connecting the data ingestion pipeline.',
            'Once CEA/MNRE data is ingested, this dashboard will display all metrics automatically.',
          ]}
        />
      </div>
    );
  }

  // ---- Success — render live data ----
  const data: EnergyMixPayload = response.data!;
  const { installedCapacity, electricityGeneration, coalVsRenewable, historicalTrends } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Energy Mix Dashboard"
        category="National Energy Intelligence"
        subtitle={`All-India installed capacity, electricity generation, coal vs renewable comparison. As of: ${response.asOf || 'Period unspecified by authority'}.`}
        badge={
          <StatusBadge
            label={data.dataFreshnessStatus === 'live' ? 'Live Telemetry' : 'Official Report'}
            variant={data.dataFreshnessStatus === 'live' ? 'success' : 'info'}
            pulse={data.dataFreshnessStatus === 'live'}
          />
        }
        actions={
          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        }
      />

      {/* ---- Section: Installed Capacity ---- */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Installed Capacity
        </h2>
        {installedCapacity ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Installed Capacity"
                value={installedCapacity.totalCapacity}
                unit={installedCapacity.unit}
                subtitle="All-India (All Sources)"
                accentColor="slate"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <MetricCard
                title="Renewable Installed Capacity"
                value={installedCapacity.renewableTotal}
                unit={installedCapacity.unit}
                subtitle={`${installedCapacity.renewableSharePercent.toFixed(1)}% of total`}
                accentColor="emerald"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                trend={{ value: `${installedCapacity.renewableSharePercent.toFixed(1)}%`, label: 'of all-India capacity', isPositive: true }}
              />
              <MetricCard
                title="Conventional Installed Capacity"
                value={installedCapacity.conventionalTotal}
                unit={installedCapacity.unit}
                subtitle={`${installedCapacity.conventionalSharePercent.toFixed(1)}% of total`}
                accentColor="amber"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <MetricCard
                title="Renewable Share of Capacity"
                value={`${installedCapacity.renewableSharePercent.toFixed(1)}%`}
                subtitle="National RE Capacity Penetration"
                accentColor="emerald"
                footnote="Renewable includes Solar, Wind, Hydro, Bio"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
            <CapacityPieChart
              renewableTotal={installedCapacity.renewableTotal}
              conventionalTotal={installedCapacity.conventionalTotal}
              unit={installedCapacity.unit}
              breakdown={installedCapacity.breakdown}
              rechartsAvailable={false}
            />
          </>
        ) : (
          <EmptyState
            title="Installed Capacity Data Not Reported"
            message="Official CEA installed capacity data has not been retrieved yet."
          />
        )}
      </section>

      {/* ---- Section: Electricity Generation ---- */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Electricity Generation
          {electricityGeneration && (
            <span className="ml-2 normal-case font-normal text-slate-400">
              — {electricityGeneration.reportingPeriod}
            </span>
          )}
        </h2>

        {electricityGeneration ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Electricity Generation"
                value={electricityGeneration.totalGeneration}
                unit={electricityGeneration.unit}
                subtitle={electricityGeneration.reportingPeriod}
                accentColor="slate"
                footnote="Installed capacity ≠ electricity generation — these are different metrics."
              />
              <MetricCard
                title="Renewable Generation"
                value={electricityGeneration.renewableTotal}
                unit={electricityGeneration.unit}
                subtitle={`${electricityGeneration.renewableSharePercent.toFixed(1)}% of total generation`}
                accentColor="emerald"
                trend={{ value: `${electricityGeneration.renewableSharePercent.toFixed(1)}%`, label: 'of total electricity', isPositive: true }}
              />
              <MetricCard
                title="Conventional Generation"
                value={electricityGeneration.conventionalTotal}
                unit={electricityGeneration.unit}
                subtitle={`${electricityGeneration.conventionalSharePercent.toFixed(1)}% of total generation`}
                accentColor="amber"
              />
              <MetricCard
                title="Renewable Share of Generation"
                value={`${electricityGeneration.renewableSharePercent.toFixed(1)}%`}
                subtitle="RE Generation Penetration"
                accentColor="emerald"
                footnote="Actual generation, not capacity factor"
              />
            </div>
            <GenerationBarChart
              breakdown={electricityGeneration.breakdown}
              unit={electricityGeneration.unit}
              reportingPeriod={electricityGeneration.reportingPeriod}
            />
          </>
        ) : (
          <EmptyState
            title="Generation Data Not Reported"
            message="Official electricity generation data for the current period has not been ingested yet."
          />
        )}
      </section>

      {/* ---- Section: Coal vs Renewable ---- */}
      {coalVsRenewable && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Coal vs Renewable Comparison
          </h2>
          <CoalVsRenewableChart data={coalVsRenewable} />
        </section>
      )}

      {/* ---- Section: Historical Trends ---- */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Historical Trends
        </h2>
        <HistoricalTrendChart data={historicalTrends ?? []} />
      </section>

      {/* ---- Source Attribution ---- */}
      <SourceAttribution
        source={response.source}
        sourceUrl={response.sourceUrl}
        asOf={response.asOf}
        retrievedAt={response.retrievedAt}
        dataFreshness={data.dataFreshnessStatus}
        notes={data.officialFootnotes}
      />
    </div>
  );
}
