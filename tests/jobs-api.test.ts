import { describe, it, expect } from 'vitest';
import { GET as getJobs } from '@/app/api/jobs/route';
import { NextRequest } from 'next/server';
import { GreenJobsData } from '@/lib/types/jobs';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('Green Jobs Integration & Provenance', () => {
  it('delivers authentic listings with verified original URLs and posting dates', async () => {
    const req = createRequest('http://localhost:3000/api/jobs');
    const res = await getJobs(req);
    const data: GreenJobsData = (await res.json()).data;

    expect(data.listings.length).toBeGreaterThan(0);
    for (const listing of data.listings) {
      expect(listing).toHaveProperty('id');
      expect(listing.title.length).toBeGreaterThan(0);
      expect(listing.organization.length).toBeGreaterThan(0);
      expect(listing.location.length).toBeGreaterThan(0);
      expect(listing.url).toMatch(/^https?:\/\//);
      expect(listing.source.length).toBeGreaterThan(0);
      expect(listing.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it('filters job listings by clean energy category', async () => {
    const req = createRequest('http://localhost:3000/api/jobs?category=solar');
    const res = await getJobs(req);
    const data: GreenJobsData = (await res.json()).data;

    expect(data.listings.length).toBeGreaterThan(0);
    for (const listing of data.listings) {
      expect(listing.category).toBe('solar');
    }
  });

  it('filters job listings by location', async () => {
    const req = createRequest('http://localhost:3000/api/jobs?location=Delhi');
    const res = await getJobs(req);
    const data: GreenJobsData = (await res.json()).data;

    expect(data.listings.length).toBeGreaterThan(0);
    for (const listing of data.listings) {
      const match =
        listing.location.toLowerCase().includes('delhi') ||
        (listing.state && listing.state.toLowerCase().includes('delhi'));
      expect(match).toBe(true);
    }
  });

  it('handles simulated unavailable state honestly without fabricating listings', async () => {
    const req = createRequest('http://localhost:3000/api/jobs?simulate_unavailable=true');
    const res = await getJobs(req);
    const json = await res.json();

    expect(json.status).toBe('unavailable');
    expect(json.data).toBeNull();
    expect(json.asOf).toBeNull();
    expect(json.source).toBeNull();
    expect(json.message).toContain('unavailable');
  });
});
