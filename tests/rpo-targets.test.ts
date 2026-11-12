import { describe, it, expect } from 'vitest';
import { GET as getRpoTargets } from '@/app/api/rpo-targets/route';
import { NextRequest } from 'next/server';
import { RpoTargetsData } from '@/lib/types/rpo';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('RPO Targets & Regulatory Trajectory', () => {
  it('delivers the complete national trajectory culminating at 43.33% by 2029-30', async () => {
    const req = createRequest('http://localhost:3000/api/rpo-targets');
    const res = await getRpoTargets(req);
    const data: RpoTargetsData = (await res.json()).data;

    const targets = data.nationalTrajectory.targetYears;
    expect(targets.length).toBeGreaterThanOrEqual(6);

    const target2030 = targets.find(t => t.financialYear === '2029-30');
    expect(target2030).toBeDefined();
    expect(target2030!.totalRpoPercent).toBe(43.33);
    expect(target2030!.windRpoPercent).toBe(6.94);
    expect(target2030!.hydroPurchaseObligationPercent).toBe(2.82);
    expect(target2030!.energyStorageObligationPercent).toBe(4.00);
  });

  it('defines all three regulatory obligated entity categories with minimum thresholds', async () => {
    const req = createRequest('http://localhost:3000/api/rpo-targets');
    const res = await getRpoTargets(req);
    const data: RpoTargetsData = (await res.json()).data;

    const entities = data.obligatedEntities;
    const types = entities.map(e => e.entityType);

    expect(types).toContain('DISCOM');
    expect(types).toContain('OPEN_ACCESS_CONSUMER');
    expect(types).toContain('CAPTIVE_POWER_PLANT');

    const openAccess = entities.find(e => e.entityType === 'OPEN_ACCESS_CONSUMER');
    expect(openAccess!.minimumThreshold).toContain('100 kW');
  });

  it('filters state regulations when state query parameter is supplied', async () => {
    const req = createRequest('http://localhost:3000/api/rpo-targets?state=MH');
    const res = await getRpoTargets(req);
    const data: RpoTargetsData = (await res.json()).data;

    expect(data.stateRegulations.length).toBe(1);
    expect(data.stateRegulations[0].stateCode).toBe('MH');
    expect(data.stateRegulations[0].stateName).toBe('Maharashtra');
  });

  it('updates current target when financial year query parameter is supplied', async () => {
    const req = createRequest('http://localhost:3000/api/rpo-targets?year=2026-27');
    const res = await getRpoTargets(req);
    const data: RpoTargetsData = (await res.json()).data;

    expect(data.nationalTrajectory.currentFiscalYear).toBe('2026-27');
    expect(data.nationalTrajectory.currentTarget.totalRpoPercent).toBe(35.95);
  });
});
