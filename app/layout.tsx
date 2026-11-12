import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'India Green Grid — Renewable Energy Intelligence',
    template: '%s | India Green Grid',
  },
  description:
    'National renewable energy decision-support platform for India. Track energy mix, RPO compliance, rooftop solar ROI, and green job opportunities — powered by official CEA and MNRE data.',
  keywords: [
    'India renewable energy',
    'CEA energy data',
    'MNRE statistics',
    'RPO compliance',
    'solar ROI calculator',
    'clean energy jobs India',
    'India energy mix dashboard',
    'green grid India',
  ],
  authors: [{ name: 'India Green Grid' }],
  openGraph: {
    title: 'India Green Grid — Renewable Energy Intelligence',
    description:
      'National renewable energy decision-support platform powered by official CEA and MNRE data.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
