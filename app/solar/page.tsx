import type { Metadata } from 'next';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const metadata: Metadata = {
  title: 'Rooftop Solar ROI Calculator',
  description: 'Estimate rooftop solar returns using verified state-wise assumptions.',
};

export default function SolarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooftop Solar ROI Calculator"
        category="Solar Decision Support"
        subtitle="Estimate your rooftop solar installation returns using verified state-wise assumptions — no fabricated numbers."
        badge={<StatusBadge label="Under Development — Member 3" variant="warning" />}
      />
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This module is owned by{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">Member 3</span>.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
          The Solar ROI Calculator will appear here once Member 3 completes implementation.
          It will consume <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">GET /api/solar-assumptions</code>.
        </p>
      </div>
    </div>
  );
}
