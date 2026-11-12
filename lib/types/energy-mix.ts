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
  coalCapacity: number;
  renewableCapacity: number;
  capacityUnit: 'GW' | 'MW';
  coalCapacitySharePercent: number;
  renewableCapacitySharePercent: number;
  
  coalGeneration?: number;
  renewableGeneration?: number;
  generationUnit?: 'BU' | 'MU' | 'TWh' | 'GWh';
  coalGenerationSharePercent?: number;
  renewableGenerationSharePercent?: number;
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

export interface EnergyMixPayload {
  installedCapacity: InstalledCapacityData | null;
  electricityGeneration: ElectricityGenerationData | null;
  coalVsRenewable: CoalVsRenewableComparison | null;
  historicalTrends: HistoricalTrendPoint[] | null;
  dataFreshnessStatus?: 'live' | 'recent' | 'historical' | 'outdated';
  officialFootnotes?: string[];
}

export type EnergyMixResponse = BaseApiResponse<EnergyMixPayload>;
