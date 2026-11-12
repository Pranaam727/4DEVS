/**
 * INDIA GREEN GRID — RENEWABLE PURCHASE OBLIGATION (RPO) TYPES
 * Unified contracts for Member 2 (Backend) and Member 3 (Calculation & UI)
 */

// Member 3 types
export type EntityType = "DISCOM" | "OPEN_ACCESS" | "CAPTIVE_USER";

export type JurisdictionCode =
  | "NATIONAL"
  | "KARNATAKA"
  | "MAHARASHTRA"
  | "GUJARAT"
  | "TAMIL_NADU"
  | "DELHI"
  | "RAJASTHAN"
  | "UTTAR_PRADESH";

export type ConsumptionUnit = "MWh" | "kWh" | "MU"; // 1 MU = 1,000 MWh = 1,000,000 kWh

export interface RPOTarget {
  id: string;
  jurisdiction: JurisdictionCode | string;
  jurisdictionName: string;
  entityType: EntityType | string;
  entityTypeName: string;
  compliancePeriod: string; // e.g. "2024-25"
  windRpoPercent: number;
  hydroRpoPercent: number; // HPO (Hydro Purchase Obligation)
  otherRpoPercent: number; // Solar, Biomass, Small Hydro, etc.
  totalRpoPercent: number;
  regulatorySource: string;
  effectiveDate: string;
  orderNumber: string;
  documentUrl?: string;
  applicabilityNotes: string;
  isVerified: boolean;
}

export interface RPOInput {
  totalConsumption: number;
  renewableProcurement: number;
  unit: ConsumptionUnit;
  entityType: string;
  jurisdiction: string;
  compliancePeriod: string;
}

export type RPOComplianceStatus =
  | "COMPLIANT"
  | "SURPLUS"
  | "SHORTFALL"
  | "ZERO_CONSUMPTION"
  | "TARGET_UNAVAILABLE"
  | "INVALID_INPUT";

export interface RPOCalculationResult {
  isValid: boolean;
  validationErrors: string[];

  // Normalized values in MWh
  totalConsumptionMWh: number;
  renewableProcurementMWh: number;
  displayUnit: ConsumptionUnit;

  // Key metrics
  applicableTargetPercent: number | null;
  targetBreakdown?: {
    windRpoPercent: number;
    hydroRpoPercent: number;
    otherRpoPercent: number;
  };
  actualRpoPercent: number;
  requiredProcurementMWh: number;
  shortfallMWh: number;
  surplusMWh: number;
  complianceStatus: RPOComplianceStatus;

  // Indian REC (Renewable Energy Certificate) equivalence
  // 1 REC = 1 MWh of renewable generation under CERC Regulations
  recEquivalentRequired: number;
  estimatedRecCostRangeInr: {
    min: number;
    max: number;
  } | null;

  // Regulatory context
  regulatorySource: string;
  effectiveDate: string;
  orderNumber: string;
  applicabilityNotes: string;

  // Formula & Assumptions
  calculationAssumptions: {
    formulaActualRpo: string;
    formulaRequiredProcurement: string;
    formulaShortfall: string;
    unitConversions: string;
    recDefinition: string;
    indicativeDisclaimer: string;
  };
}

// Member 2 types
export type RpoCategory = 'wind' | 'hydro' | 'other_re' | 'energy_storage' | 'total';

export interface RpoYearlyTarget {
  financialYear: string; // "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30"
  windRpoPercent: number;
  hydroPurchaseObligationPercent: number; // HPO for LHPs/PSPs commissioned after 08.03.2019
  otherRpoPercent: number; // Solar, bioenergy, small hydro, etc.
  energyStorageObligationPercent: number; // ESO (mandating >=85% storage charged from RE)
  totalRpoPercent: number; // Cumulative percentage of total energy consumption
}

export interface ObligatedEntityDefinition {
  entityType: 'DISCOM' | 'CAPTIVE_POWER_PLANT' | 'OPEN_ACCESS_CONSUMER';
  name: string;
  minimumThreshold: string;
  complianceMethod: string[];
  penaltyForNonCompliance: string;
}

export interface StateRpoRegulation {
  stateCode: string;
  stateName: string;
  sercName: string;
  latestRegulationYear: string;
  currentYearTargetPercent: number;
  deviationsFromNationalTrajectory: string;
  regulationDocumentUrl: string;
}

export interface RegulatoryReference {
  orderNumber: string;
  issuingAuthority: 'Ministry of Power' | 'MNRE' | 'CERC' | 'SERC';
  title: string;
  issueDate: string;
  effectiveDate: string;
  documentUrl: string;
  summary: string;
}

export interface RpoTargetsData {
  nationalTrajectory: {
    framework: string;
    targetYears: RpoYearlyTarget[];
    currentFiscalYear: string;
    currentTarget: RpoYearlyTarget;
  };
  obligatedEntities: ObligatedEntityDefinition[];
  stateRegulations: StateRpoRegulation[];
  regulatoryReferences: RegulatoryReference[];
  meta: {
    governingAct: string;
    amendmentNotes: string;
    lastUpdated: string;
  };
}
