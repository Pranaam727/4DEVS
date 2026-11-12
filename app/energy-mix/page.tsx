import type { Metadata } from 'next';
import { EnergyMixDashboard } from '@/components/dashboard/EnergyMixDashboard';

export const metadata: Metadata = {
  title: 'Energy Mix Dashboard',
  description:
    'All-India installed capacity and electricity generation dashboard — Solar, Wind, Hydro, Thermal, Nuclear. Official CEA data.',
};

export default function EnergyMixPage() {
  return <EnergyMixDashboard />;
}
