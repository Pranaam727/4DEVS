import { BaseApiResponse } from './api';

export interface FuelCategoryBreakdown {
  fuel: string;             // e.g. "Solar", "Wind", "Large Hydro", "Coal", "Nuclear", "Gas"
  value: number;            // Capacity or Generation amount
  sharePercent: number;     // Share in percentage (0 - 100)
  isRenewable: boolean;     // Whether classified under RE by MNRE/CEA
  color?: string;           // Optional UI theme color
}

export interface InstalledCapacityData {
  totalCapacity: number;              // Total all-India installed capacity
  unit: 'GW' | 'MW';                  // Capacity unit
  renewableTotal: number;             // Total RE (Solar, Wind, Bio, Small & Large Hydro as per CEA)
  conventionalTotal: number;          // Total Conventional (Thermal, Nuclear)
  renewableSharePercent: number;      // % of total
  conventionalSharePercent: number;   // % of total
  breakdown: FuelCategoryBreakdown[]; // Detailed fuel-wise capacity
}

export interface ElectricityGenerationData {
  totalGeneration: number;            // Total gross or net generation
  unit: 'BU' | 'MU' | 'TWh' | 'GWh';  // Generation unit (BU = Billion Units = 1 TWh)
  reportingPeriod: string;            // e.g. "October 2024" or "April-October 2024"
  renewableTotal: number;             // RE gross generation
  conventionalTotal: number;          // Conventional generation
  renewableSharePercent: number;      // % of total generation
  conventionalSharePercent: number;   // % of total generation
  breakdown: FuelCategoryBreakdown[]; // Detailed fuel-wise generation
}

export interface CoalVsRenewableComparison {
  // Member 1 flat structure
  coalCapacity?: number;
  renewableCapacity?: number;
  capacityUnit?: 'GW' | 'MW';
  coalCapacitySharePercent?: number;
  renewableCapacitySharePercent?: number;
  coalGeneration?: number;
  renewableGeneration?: number;
  generationUnit?: 'BU' | 'MU' | 'TWh' | 'GWh';
  coalGenerationSharePercent?: number;
  renewableGenerationSharePercent?: number;

  // Member 2 nested structure
  capacity?: {
    coalMW: number;
    resOnlyMW: number;
    resPlusHydroMW: number;
    coalPercentage: number;
    resOnlyPercentage: number;
    cleanEnergyPercentage: number;
    differenceMW: number;
    crossoverAchieved: boolean;
  };
  generation?: {
    coalMU: number;
    renewableMU: number;
    coalPercentage: number;
    renewablePercentage: number;
    ratioCoalToRenewable: number;
  };
}

export interface HistoricalTrendPoint {
  period: string;                     // e.g. "FY 2020", "FY 2021", "2024-Q1"
  renewableCapacity?: number;
  conventionalCapacity?: number;
  coalCapacity?: number;
  renewableGeneration?: number;
  conventionalGeneration?: number;
  coalGeneration?: number;
}

// Member 2 detailed CEA breakdown types
export interface RenewableCapacityBreakdown {
  solarMW: number;
  windMW: number;
  smallHydroMW: number;
  bioPowerMW: number;
  wasteToEnergyMW: number;
  totalResMW: number;
}

export interface ConventionalCapacityBreakdown {
  coalMW: number;
  ligniteMW: number;
  gasMW: number;
  dieselMW: number;
  totalThermalMW: number;
}

export interface InstalledCapacitySummary {
  asOf: string;
  unit: 'MW';
  thermal: ConventionalCapacityBreakdown;
  nuclearMW: number;
  largeHydroMW: number;
  renewables: RenewableCapacityBreakdown;
  totalMW: number;
  totalGW: number;
  nonFossilSharePercent: number;
  fossilSharePercent: number;
  cleanEnergySharePercent: number;
}

export interface ElectricityGenerationSummary {
  period: string;
  unit: 'MU' | 'GWh';
  thermalMU: {
    coalMU: number;
    ligniteMU: number;
    gasMU: number;
    dieselMU: number;
    totalThermalMU: number;
  };
  nuclearMU: number;
  largeHydroMU: number;
  renewableMU: {
    solarMU: number;
    windMU: number;
    biomassMU: number;
    smallHydroMU: number;
    totalResMU: number;
  };
  totalGenerationMU: number;
  coalGenerationSharePercent: number;
  renewableGenerationSharePercent: number;
}

export interface HistoricalCapacityRecord {
  financialYear: string;
  asOfDate: string;
  thermalMW: number;
  nuclearMW: number;
  hydroMW: number;
  resMW: number;
  totalMW: number;
  resGrowthPercentYearOverYear: number | null;
  coalSharePercent: number;
  cleanSharePercent: number;
}

export interface RegionalCapacityRecord {
  region: 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'North Eastern' | 'Islands';
  thermalMW: number;
  nuclearMW: number;
  hydroMW: number;
  resMW: number;
  totalMW: number;
}

export interface EnergyMixPayload {
  installedCapacity: InstalledCapacityData | null;
  electricityGeneration: ElectricityGenerationData | null;
  coalVsRenewable: CoalVsRenewableComparison | null;
  historicalTrends: HistoricalTrendPoint[] | null;
  dataFreshnessStatus?: 'live' | 'recent' | 'historical' | 'outdated';
  officialFootnotes?: string[];

  capacity?: InstalledCapacitySummary;
  generation?: ElectricityGenerationSummary;
  comparison?: CoalVsRenewableComparison;
  historical?: HistoricalCapacityRecord[];
  regional?: RegionalCapacityRecord[];
  meta?: {
    capacitySource: string;
    generationSource: string;
    ceaReportReference: string;
    lastUpdated: string;
  };
}

export interface EnergyMixData {
  capacity: InstalledCapacitySummary;
  generation: ElectricityGenerationSummary;
  comparison: CoalVsRenewableComparison;
  historical: HistoricalCapacityRecord[];
  regional: RegionalCapacityRecord[];
  meta: {
    capacitySource: string;
    generationSource: string;
    ceaReportReference: string;
    lastUpdated: string;
  };
  installedCapacity?: InstalledCapacityData | null;
  electricityGeneration?: ElectricityGenerationData | null;
  coalVsRenewable?: CoalVsRenewableComparison | null;
  historicalTrends?: HistoricalTrendPoint[] | null;
  dataFreshnessStatus?: 'live' | 'recent' | 'historical' | 'outdated';
  officialFootnotes?: string[];
}

export type EnergyMixResponse = BaseApiResponse<EnergyMixPayload>;
