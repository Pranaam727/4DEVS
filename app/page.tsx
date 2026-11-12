import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India Green Grid — National Renewable Energy Intelligence',
};

const features = [
  {
    title: 'Energy Mix Dashboard',
    href: '/energy-mix',
    description:
      'Track all-India installed capacity and actual electricity generation across solar, wind, hydro, thermal, and nuclear — sourced directly from CEA official reports.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    color: 'emerald',
    badge: 'CEA Official Data',
  },
  {
    title: 'RPO Compliance Tracker',
    href: '/rpo',
    description:
      'Calculate your Renewable Purchase Obligation compliance status using verified regulatory targets from the MNRE, based on your actual energy consumption.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: 'sky',
    badge: 'MNRE Targets',
  },
  {
    title: 'Rooftop Solar ROI Calculator',
    href: '/solar',
    description:
      'Estimate your rooftop solar installation returns using verified state-wise assumptions — no fabricated numbers, no hidden assumptions.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    color: 'amber',
    badge: 'State-Verified Data',
  },
  {
    title: 'Green Jobs Board',
    href: '/jobs',
    description:
      'Discover verified clean energy career opportunities across India — renewable energy, grid infrastructure, climate tech, and sustainability roles.',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    color: 'violet',
    badge: 'Verified Listings',
  },
];

const colorConfig: Record<string, { bg: string; border: string; iconBg: string; badge: string; link: string }> = {
  emerald: {
    bg: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20',
    border: 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    link: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
  },
  sky: {
    bg: 'hover:bg-sky-50/60 dark:hover:bg-sky-950/20',
    border: 'border-slate-200 dark:border-slate-800 hover:border-sky-500/40 dark:hover:border-sky-500/30',
    iconBg: 'bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    link: 'text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300',
  },
  amber: {
    bg: 'hover:bg-amber-50/60 dark:hover:bg-amber-950/20',
    border: 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/30',
    iconBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    link: 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
  },
  violet: {
    bg: 'hover:bg-violet-50/60 dark:hover:bg-violet-950/20',
    border: 'border-slate-200 dark:border-slate-800 hover:border-violet-500/40 dark:hover:border-violet-500/30',
    iconBg: 'bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    link: 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300',
  },
};

const stats = [
  { label: 'All-India Installed Capacity', note: 'Per latest CEA bulletin' },
  { label: 'Renewable Energy Target by 2030', note: 'Government of India goal' },
  { label: 'Solar Capacity (Utility Scale)', note: 'As per CEA' },
  { label: 'Wind Capacity (On-shore & Off-shore)', note: 'As per CEA' },
];

export default function HomePage() {
  return (
    <div className="space-y-16 py-6">

      {/* ---- Hero Section ---- */}
      <section className="text-center space-y-6 py-8 relative">
        {/* Accent pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Official CEA + MNRE data integration &bull; Strictly no fabricated numbers
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
          India&apos;s Renewable Energy
          <br />
          <span className="text-emerald-600 dark:text-emerald-400">
            Intelligence Platform
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Actionable insights on India&apos;s energy transition — energy mix and generation, RPO compliance,
          solar economics, and green career opportunities — grounded entirely in
          official government data from CEA, MNRE, and Grid-India.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/energy-mix"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Energy Dashboard
          </Link>
          <Link
            href="/rpo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 font-semibold rounded-xl shadow-xs transition-all hover:scale-[1.02] focus:outline-hidden focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Check RPO Compliance
          </Link>
        </div>

        {/* Data integrity disclaimer */}
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xl mx-auto">
          All metrics are retrieved from official sources only.
          If a data point is unverified or unavailable, it will be clearly marked — not filled with estimates.
        </p>
      </section>

      {/* ---- Stat Placeholders (intentionally no numbers — data comes from backend) ---- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-4 text-center"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="text-xs text-slate-400 mt-1.5 italic">{stat.note}</div>
            <div className="mt-2">
              <Link
                href="/energy-mix"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                See live data →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* ---- Feature Cards ---- */}
      <section className="space-y-4">
        <div className="text-center space-y-1.5 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Four Intelligence Modules
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Covering India&apos;s energy transition from generation to careers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature) => {
            const c = colorConfig[feature.color];
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group relative rounded-2xl border p-6 bg-white dark:bg-slate-900/70 shadow-xs transition-all duration-200 hover:shadow-md ${c.bg} ${c.border} focus:outline-hidden focus:ring-2 focus:ring-offset-2`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${c.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100">
                        {feature.title}
                      </h3>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${c.badge}`}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                    <span className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${c.link}`}>
                      Open module
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---- Data Sources ---- */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Data Sources</h3>
            <p className="text-xs text-slate-500">Verified government and statutory body publications only</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: 'Central Electricity Authority (CEA)',
              domain: 'Ministry of Power, GoI',
              url: 'https://cea.nic.in',
              desc: 'Installed capacity, electricity generation, monthly executive reports, and load generation balance reports.',
            },
            {
              name: 'MNRE — Min. of New & Renewable Energy',
              domain: 'Government of India',
              url: 'https://mnre.gov.in',
              desc: 'Renewable Energy purchase obligations, state-wise targets, solar-park data, and subsidy notifications.',
            },
            {
              name: 'Grid-India / POSOCO',
              domain: 'Ministry of Power, GoI',
              url: 'https://posoco.in',
              desc: 'Real-time and periodic electricity generation, demand telemetry, and renewable integration data.',
            },
          ].map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {src.name}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5 mb-1.5 font-medium">
                {src.domain}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {src.desc}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* ---- Data Integrity Notice ---- */}
      <section className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-5 flex gap-4 items-start">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Strict Zero-Demo-Data Policy</h4>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
            This platform never uses fabricated energy statistics, mock API responses, or hardcoded sample records.
            If official data is not yet available from our backend ingestion pipeline, all dashboards display
            an honest &ldquo;data unavailable&rdquo; state rather than showing synthetic figures.
            All source, publication date, and retrieval timestamps are displayed transparently.
          </p>
        </div>
      </section>
    </div>
  );
}
