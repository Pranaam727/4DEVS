/**
 * INDIA GREEN GRID — SOLAR ASSUMPTIONS & SUBSIDY TYPES
 * Unified contracts for Member 2 (Backend) and Member 3 (Calculation & UI)
 */

// Member 3 types
export type ConsumerCategory =
  | "RESIDENTIAL"
  | "HOUSING_SOCIETY"
  | "COMMERCIAL"
  | "INDUSTRIAL";

export interface SolarStateAssumption {
  stateCode: string;
  stateName: string;
  annualGenerationPerKW: number;
  dailySunHours: number;
  benchmarkTariffInr: number;
  areaRequiredPerKW_SqFt: number;
  benchmarkCostPerKw: {
    upTo2kW: number;
    upTo3kW: number;
    upTo10kW: number;
    above10kW: number;
  };
  subsidySchemeName: string;
  subsidyAvailable: boolean;
  subsidyRules: {
    residential1kW: number;
    residential2kW: number;
    residential3kW: number;
    residentialMaxCap: number;
    housingSocietyPerKW: number;
    commercialEligible: boolean;
  };
  gridEmissionFactorKgPerKWh: number;
  dataSource: string;
  lastUpdated: string;
}

export interface SolarInput {
  state: string;
  monthlyBillInr: number;
  electricityTariffInr: number;
  rooftopAreaSqFt: number;
  consumerCategory: ConsumerCategory;
  proposedCapacityKW?: number;
}

export interface SolarCalculationResult {
  isValid: boolean;
  validationErrors: string[];
  estimatedMonthlyConsumptionKWh: number;
  estimatedAnnualConsumptionKWh: number;
  maxCapacityFromAreaKW: number;
  recommendedCapacityFromConsumptionKW: number;
  recommendedSystemCapacityKW: number;
  effectiveCapacityKW: number;
  estimatedDailyGenerationKWh: number;
  estimatedAnnualGenerationKWh: number;
  estimatedAnnualSavingsInr: number;
  estimatedMonthlySavingsInr: number;
  estimatedGrossCostInr: number;
  benchmarkCostPerKWInr: number;
  applicableSubsidyInr: number;
  netInvestmentInr: number;
  paybackPeriodYears: number;
  lifetime25YrSavingsInr: number;
  annualCO2AvoidedTonnes: number;
  lifetimeCO2AvoidedTonnes: number;
  equivalentTreesPlanted: number;
  formulasAndAssumptions: {
    formulaConsumption: string;
    formulaRecommendedCapacity: string;
    formulaGeneration: string;
    formulaCost: string;
    formulaSubsidy: string;
    formulaPayback: string;
    ceaEmissionFactorSource: string;
    subsidyReference: string;
    disclaimer: string;
  };
  stateAssumptionUsed: SolarStateAssumption | null;
}

// Member 2 types
export interface SubsidySlab {
  capacityRangeKw: string;
  minKw: number;
  maxKw: number | null;
  centralSubsidyInr: number;
  subsidyRateDescription: string;
  calculationFormula: string;
}

export interface GroupHousingSubsidy {
  applicableTo: 'Group Housing Societies (GHS)' | 'Residential Welfare Associations (RWA)';
  ratePerKwInr: number;
  maxCapacityKw: number;
  maxSubsidyInr: number;
  eligiblePurposes: string[];
}

export interface InstallationBenchmarkCost {
  systemSizeKw: number;
  estimatedGrossCostMinInr: number;
  estimatedGrossCostMaxInr: number;
  estimatedGrossCostAvgInr: number;
  applicableCentralSubsidyInr: number;
  estimatedNetCostAvgInr: number;
  expectedAnnualGenerationKwh: number;
  roofAreaRequiredSqFt: number;
}

export interface StateTariffSlab {
  slabRangeUnits: string;
  ratePerKwhInr: number;
}

export interface StateSolarPolicy {
  stateCode: string;
  stateName: string;
  discomNames: string[];
  averageDomesticTariffInrPerKwh: number;
  tariffSlabs: StateTariffSlab[];
  stateAdditionalSubsidyInr: number;
  stateIncentiveNotes: string;
  netMeteringCapPercentOfTransformer: number;
  virtualNetMeteringAvailable: boolean;
  groupNetMeteringAvailable: boolean;
  sercTariffOrderReference: string;
}

export interface SolarAssumptionsData {
  schemeName: string;
  schemeLaunchDate: string;
  centralMinistry: string;
  portalUrl: string;
  subsidySlabs: SubsidySlab[];
  groupHousingSubsidy: GroupHousingSubsidy;
  benchmarkCosts: InstallationBenchmarkCost[];
  generationAssumptions: {
    averageDailyUnitsPerKw: number;
    averageAnnualUnitsPerKw: number;
    performanceRatioPercent: number;
    lifespanYears: number;
    moduleDegradationPercentPerYear: number;
    roofAreaSqFtPerKw: number;
  };
  eligibilityConditions: string[];
  mandatoryTechnicalStandards: string[];
  statePolicies: StateSolarPolicy[];
  meta: {
    officialNotificationNumber: string;
    effectiveDate: string;
    lastUpdated: string;
  };
}
