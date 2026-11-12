import type { Metadata } from 'next';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const metadata: Metadata = {
  title: 'Green Jobs Board',
  description: 'Verified clean energy career opportunities across India.',
};

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Green Jobs Board"
        category="Clean Energy Careers"
        subtitle="Verified renewable energy, grid infrastructure, and climate-tech career opportunities across India."
        badge={<StatusBadge label="Under Development — Member 3" variant="warning" />}
      />
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This module is owned by{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">Member 3</span>.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
          The Jobs Board will appear here once Member 3 completes implementation.
          It will consume <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">GET /api/jobs</code>.
        </p>
      </div>
    </div>
  );
}
