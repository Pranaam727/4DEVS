import { describe, it, expect } from 'vitest';
import { GET as getEnergyMix } from '@/app/api/energy-mix/route';
import { NextRequest } from 'next/server';
import { EnergyMixData } from '@/lib/types/energy-mix';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('Energy Mix Domain Logic & Normalization', () => {
  it('strictly separates Capacity (MW) from Generation (MU)', async () => {
    const req = createRequest('http://localhost:3000/api/energy-mix');
    const res = await getEnergyMix(req);
    const json = await res.json();
    const data: EnergyMixData = json.data;

    // Capacity verification
    expect(data.capacity.unit).toBe('MW');
    expect(data.capacity.totalMW).toBeGreaterThan(400000); // India > 400 GW
    expect(data.capacity.totalGW).toBeCloseTo(data.capacity.totalMW / 1000, 1);

    // Generation verification
    expect(data.generation.unit).toBe('MU');
    expect(data.generation.totalGenerationMU).toBeGreaterThan(1000000); // India annual > 1.5 million MU
    expect(data.generation.coalGenerationSharePercent).toBeGreaterThan(60); // Coal dominates generation
  });

  it('correctly aggregates constituent thermal and RES capacity totals', async () => {
    const req = createRequest('http://localhost:3000/api/energy-mix');
    const res = await getEnergyMix(req);
    const data: EnergyMixData = (await res.json()).data;

    const { thermal, renewables, nuclearMW, largeHydroMW, totalMW } = data.capacity;

    const calculatedThermal = thermal.coalMW + thermal.ligniteMW + thermal.gasMW + thermal.dieselMW;
    expect(thermal.totalThermalMW).toBeCloseTo(calculatedThermal, 2);

    const calculatedRes =
      renewables.solarMW +
      renewables.windMW +
      renewables.smallHydroMW +
      renewables.bioPowerMW +
      renewables.wasteToEnergyMW;
    expect(renewables.totalResMW).toBeCloseTo(calculatedRes, 2);

    const calculatedTotal = calculatedThermal + nuclearMW + largeHydroMW + calculatedRes;
    expect(totalMW).toBeCloseTo(calculatedTotal, 2);
  });

  it('distinguishes zero (0) from missing (null) in historical records', async () => {
    const req = createRequest('http://localhost:3000/api/energy-mix');
    const res = await getEnergyMix(req);
    const data: EnergyMixData = (await res.json()).data;

    // Baseline historical year (2021-22) must have null for YoY growth, NOT 0
    const baseline = data.historical.find(h => h.financialYear === '2021-22');
    expect(baseline).toBeDefined();
    expect(baseline!.resGrowthPercentYearOverYear).toBeNull();

    // Subsequent years must have positive numeric growth
    const subsequent = data.historical.find(h => h.financialYear === '2022-23');
    expect(subsequent).toBeDefined();
    expect(typeof subsequent!.resGrowthPercentYearOverYear).toBe('number');
    expect(subsequent!.resGrowthPercentYearOverYear!).toBeGreaterThan(0);

    // Eastern region has 0 nuclear MW (explicit zero, NOT null)
    const eastern = data.regional.find(r => r.region === 'Eastern');
    expect(eastern).toBeDefined();
    expect(eastern!.nuclearMW).toBe(0);
    expect(eastern!.nuclearMW).not.toBeNull();
  });

  it('provides accurate Coal vs. Clean Energy comparison metrics', async () => {
    const req = createRequest('http://localhost:3000/api/energy-mix');
    const res = await getEnergyMix(req);
    const data: EnergyMixData = (await res.json()).data;

    const comp = data.comparison;
    expect(comp.capacity!.coalMW).toBeGreaterThan(200000);
    expect(comp.capacity!.resPlusHydroMW).toBeGreaterThan(200000);
    expect(typeof comp.capacity!.crossoverAchieved).toBe('boolean');

    // Generation ratio reflects high thermal PLF vs variable renewable CUF
    expect(comp.generation!.ratioCoalToRenewable).toBeGreaterThan(2.0);
  });
});
