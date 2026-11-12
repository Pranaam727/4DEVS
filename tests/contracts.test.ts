import { describe, it, expect } from 'vitest';
import { GET as getEnergyMix } from '@/app/api/energy-mix/route';
import { GET as getRpoTargets } from '@/app/api/rpo-targets/route';
import { GET as getSolarAssumptions } from '@/app/api/solar-assumptions/route';
import { GET as getJobs } from '@/app/api/jobs/route';
import { NextRequest } from 'next/server';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('Shared API Response Contract Verification', () => {
  it('GET /api/energy-mix conforms to success contract envelope', async () => {
    const req = createRequest('http://localhost:3000/api/energy-mix');
    const res = await getEnergyMix(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('status', 'success');
    expect(json).toHaveProperty('asOf');
    expect(typeof json.asOf).toBe('string');
    expect(json.asOf.length).toBeGreaterThan(0);
    expect(json).toHaveProperty('retrievedAt');
    expect(typeof json.retrievedAt).toBe('string');
    expect(json).toHaveProperty('source');
    expect(typeof json.source).toBe('string');
    expect(json).toHaveProperty('sourceUrl');
    expect(json.sourceUrl).toMatch(/^https?:\/\//);
    expect(json).toHaveProperty('data');
    expect(typeof json.data).toBe('object');
    expect(json.data).not.toBeNull();
  });

  it('GET /api/rpo-targets conforms to success contract envelope', async () => {
    const req = createRequest('http://localhost:3000/api/rpo-targets');
    const res = await getRpoTargets(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('status', 'success');
    expect(json).toHaveProperty('asOf');
    expect(json).toHaveProperty('retrievedAt');
    expect(json).toHaveProperty('source');
    expect(json).toHaveProperty('sourceUrl');
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('nationalTrajectory');
  });

  it('GET /api/solar-assumptions conforms to success contract envelope', async () => {
    const req = createRequest('http://localhost:3000/api/solar-assumptions');
    const res = await getSolarAssumptions(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('status', 'success');
    expect(json).toHaveProperty('asOf');
    expect(json).toHaveProperty('retrievedAt');
    expect(json).toHaveProperty('source');
    expect(json).toHaveProperty('sourceUrl');
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('subsidySlabs');
  });

  it('GET /api/jobs conforms to success contract envelope', async () => {
    const req = createRequest('http://localhost:3000/api/jobs');
    const res = await getJobs(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('status', 'success');
    expect(json).toHaveProperty('asOf');
    expect(json).toHaveProperty('retrievedAt');
    expect(json).toHaveProperty('source');
    expect(json).toHaveProperty('sourceUrl');
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('listings');
  });

  it('GET /api/jobs returns honest unavailable response when simulation requested', async () => {
    const req = createRequest('http://localhost:3000/api/jobs?simulate_unavailable=true');
    const res = await getJobs(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('unavailable');
    expect(json.asOf).toBeNull();
    expect(json.source).toBeNull();
    expect(json.sourceUrl).toBeNull();
    expect(json.data).toBeNull();
    expect(typeof json.message).toBe('string');
    expect(json.message.length).toBeGreaterThan(0);
  });
});
