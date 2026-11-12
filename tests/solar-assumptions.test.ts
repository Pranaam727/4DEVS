import { describe, it, expect } from 'vitest';
import { GET as getSolarAssumptions } from '@/app/api/solar-assumptions/route';
import { NextRequest } from 'next/server';
import { SolarAssumptionsData } from '@/lib/types/solar';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('Solar Assumptions & PM Surya Ghar Subsidy Rules', () => {
  it('delivers authentic central subsidy slabs according to official MNRE notification', async () => {
    const req = createRequest('http://localhost:3000/api/solar-assumptions');
    const res = await getSolarAssumptions(req);
    const data: SolarAssumptionsData = (await res.json()).data;

    expect(data.schemeName).toBe('PM Surya Ghar: Muft Bijli Yojana');
    expect(data.subsidySlabs.length).toBe(3);

    const slab1kW = data.subsidySlabs.find(s => s.minKw === 1);
    expect(slab1kW!.centralSubsidyInr).toBe(30000);

    const slab2kW = data.subsidySlabs.find(s => s.minKw === 2);
    expect(slab2kW!.centralSubsidyInr).toBe(60000);

    const slab3kWPlus = data.subsidySlabs.find(s => s.minKw === 3);
    expect(slab3kWPlus!.centralSubsidyInr).toBe(78000);
  });

  it('correctly caps residential subsidy at ₹78,000 for 5 kW and 10 kW systems', async () => {
    // 5 kW request
    const req5 = createRequest('http://localhost:3000/api/solar-assumptions?capacityKw=5');
    const res5 = await getSolarAssumptions(req5);
    const data5 = (await res5.json()).data;

    expect(data5.tailoredCalculation.requestedCapacityKw).toBe(5);
    expect(data5.tailoredCalculation.eligibleCentralSubsidyInr).toBe(78000); // Must be strictly capped at 78,000!

    // 10 kW request
    const req10 = createRequest('http://localhost:3000/api/solar-assumptions?capacityKw=10');
    const res10 = await getSolarAssumptions(req10);
    const data10 = (await res10.json()).data;

    expect(data10.tailoredCalculation.requestedCapacityKw).toBe(10);
    expect(data10.tailoredCalculation.eligibleCentralSubsidyInr).toBe(78000); // Must still be capped at 78,000!
  });

  it('calculates expected generation and payback period on tailored capacity query', async () => {
    const req = createRequest('http://localhost:3000/api/solar-assumptions?capacityKw=3');
    const res = await getSolarAssumptions(req);
    const data = (await res.json()).data;

    const calc = data.tailoredCalculation;
    expect(calc.requestedCapacityKw).toBe(3);
    expect(calc.eligibleCentralSubsidyInr).toBe(78000);
    expect(calc.expectedAnnualGenerationKwh).toBe(4500); // 3 kW * 1500 kWh/kW
    expect(calc.estimatedNetCostInr).toBeLessThan(calc.estimatedGrossCostInr);
    expect(calc.estimatedPaybackYears).toBeGreaterThan(0);
    expect(calc.estimatedPaybackYears).toBeLessThan(7); // Typical 3-4 year payback
  });

  it('verifies group housing society subsidy framework', async () => {
    const req = createRequest('http://localhost:3000/api/solar-assumptions');
    const res = await getSolarAssumptions(req);
    const data: SolarAssumptionsData = (await res.json()).data;

    expect(data.groupHousingSubsidy.ratePerKwInr).toBe(18000);
    expect(data.groupHousingSubsidy.maxCapacityKw).toBe(500);
    expect(data.groupHousingSubsidy.maxSubsidyInr).toBe(9000000);
  });

  it('contains mandatory Domestic Content Requirement (DCR) eligibility conditions', async () => {
    const req = createRequest('http://localhost:3000/api/solar-assumptions');
    const res = await getSolarAssumptions(req);
    const data: SolarAssumptionsData = (await res.json()).data;

    const dcrCondition = data.eligibilityConditions.some(c => c.includes('Domestic Content Requirement (DCR)'));
    expect(dcrCondition).toBe(true);
  });
});
