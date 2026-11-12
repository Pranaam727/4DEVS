import {
  RPOInput,
  RPOTarget,
  RPOCalculationResult,
  RPOComplianceStatus,
  ConsumptionUnit,
} from "../types/rpo";

/**
 * Converts any consumption unit to MWh for uniform arithmetic.
 * 1 MU (Million Units) = 1,000,000 kWh = 1,000 MWh
 * 1 kWh = 0.001 MWh
 * 1 MWh = 1 MWh
 */
export function convertToMWh(value: number, unit: ConsumptionUnit): number {
  if (value < 0 || isNaN(value)) return 0;
  switch (unit) {
    case "kWh":
      return value / 1000;
    case "MU":
      return value * 1000;
    case "MWh":
    default:
      return value;
  }
}

/**
 * Validates user inputs for RPO calculations.
 */
export function validateRpoInput(input: RPOInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof input.totalConsumption !== "number" || isNaN(input.totalConsumption)) {
    errors.push("Total electricity consumption must be a valid number.");
  } else if (input.totalConsumption < 0) {
    errors.push("Total electricity consumption cannot be negative.");
  }

  if (
    typeof input.renewableProcurement !== "number" ||
    isNaN(input.renewableProcurement)
  ) {
    errors.push("Renewable electricity procurement must be a valid number.");
  } else if (input.renewableProcurement < 0) {
    errors.push("Renewable electricity procurement cannot be negative.");
  }

  if (!input.entityType || input.entityType.trim() === "") {
    errors.push("Please select an applicable entity type (e.g. DISCOM, Open Access, Captive).");
  }

  if (!input.jurisdiction || input.jurisdiction.trim() === "") {
    errors.push("Please select an applicable regulatory jurisdiction.");
  }

  if (!input.compliancePeriod || input.compliancePeriod.trim() === "") {
    errors.push("Please select a compliance period.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Finds the matching verified RPO target based on jurisdiction, entity type and compliance period.
 * Does not assume one single percentage applies to every entity or state.
 */
export function findMatchingTarget(
  targets: RPOTarget[],
  jurisdiction: string,
  entityType: string,
  compliancePeriod: string
): RPOTarget | null {
  if (!targets || targets.length === 0) return null;

  // 1. Direct match: jurisdiction, entityType, and period
  const exact = targets.find(
    (t) =>
      t.jurisdiction.toLowerCase() === jurisdiction.toLowerCase() &&
      t.entityType.toLowerCase() === entityType.toLowerCase() &&
      t.compliancePeriod.toLowerCase() === compliancePeriod.toLowerCase()
  );
  if (exact) return exact;

  // 2. State-level match for that period
  const stateMatch = targets.find(
    (t) =>
      t.jurisdiction.toLowerCase() === jurisdiction.toLowerCase() &&
      t.compliancePeriod.toLowerCase() === compliancePeriod.toLowerCase()
  );
  if (stateMatch) return stateMatch;

  // 3. National unified trajectory match (MoP trajectory)
  const nationalMatch = targets.find(
    (t) =>
      (t.jurisdiction.toLowerCase() === "national" ||
        t.jurisdiction.toLowerCase() === "mop") &&
      t.compliancePeriod.toLowerCase() === compliancePeriod.toLowerCase()
  );
  if (nationalMatch) return nationalMatch;

  return null;
}

/**
 * Calculates RPO Compliance metrics.
 *
 * Formulas:
 * Actual RPO (%) = (Renewable Procurement / Total Electricity Consumption) * 100
 * Required Renewable Procurement = Total Electricity Consumption * Applicable RPO Target
 * Shortfall = max(0, Required Renewable Procurement - Actual Renewable Procurement)
 */
export function calculateRPOCompliance(
  input: RPOInput,
  target: RPOTarget | null
): RPOCalculationResult {
  const validation = validateRpoInput(input);

  // Default formulas & metadata
  const calculationAssumptions = {
    formulaActualRpo: "Actual RPO (%) = (Renewable Procurement / Total Electricity Consumption) × 100",
    formulaRequiredProcurement: "Required Renewable Procurement = Total Electricity Consumption × (Applicable RPO Target / 100)",
    formulaShortfall: "Shortfall = max(0, Required Renewable Procurement - Actual Renewable Procurement)",
    unitConversions: "1 MU (Million Units) = 1,000 MWh = 1,000,000 kWh. Calculations normalized to MWh.",
    recDefinition: "1 Renewable Energy Certificate (REC) represents 1 MWh of renewable electricity under CERC Regulations.",
    indicativeDisclaimer:
      "All figures are indicative estimates derived from official Ministry of Power (MoP) and State Electricity Regulatory Commission (SERC) published orders. Final compliance determinations are issued by the designated State Nodal Agency (SNA).",
  };

  if (!validation.isValid) {
    return {
      isValid: false,
      validationErrors: validation.errors,
      totalConsumptionMWh: 0,
      renewableProcurementMWh: 0,
      displayUnit: input.unit || "MWh",
      applicableTargetPercent: target ? target.totalRpoPercent : null,
      actualRpoPercent: 0,
      requiredProcurementMWh: 0,
      shortfallMWh: 0,
      surplusMWh: 0,
      complianceStatus: "INVALID_INPUT",
      recEquivalentRequired: 0,
      estimatedRecCostRangeInr: null,
      regulatorySource: target?.regulatorySource || "Unavailable",
      effectiveDate: target?.effectiveDate || "N/A",
      orderNumber: target?.orderNumber || "N/A",
      applicabilityNotes: target?.applicabilityNotes || "No verified target matched.",
      calculationAssumptions,
    };
  }

  const totalConsumptionMWh = convertToMWh(input.totalConsumption, input.unit);
  const renewableProcurementMWh = convertToMWh(
    input.renewableProcurement,
    input.unit
  );

  // Edge case: Zero total consumption
  if (totalConsumptionMWh === 0) {
    return {
      isValid: true,
      validationErrors: [],
      totalConsumptionMWh: 0,
      renewableProcurementMWh,
      displayUnit: input.unit,
      applicableTargetPercent: target ? target.totalRpoPercent : null,
      actualRpoPercent: 0,
      requiredProcurementMWh: 0,
      shortfallMWh: 0,
      surplusMWh: renewableProcurementMWh,
      complianceStatus: "ZERO_CONSUMPTION",
      recEquivalentRequired: 0,
      estimatedRecCostRangeInr: null,
      regulatorySource: target?.regulatorySource || "No regulatory order applied",
      effectiveDate: target?.effectiveDate || "N/A",
      orderNumber: target?.orderNumber || "N/A",
      applicabilityNotes:
        "Zero electricity consumption was reported for this compliance period. RPO obligation evaluates to zero.",
      calculationAssumptions,
    };
  }

  // Edge case: Target missing
  if (!target) {
    const rawActual = (renewableProcurementMWh / totalConsumptionMWh) * 100;
    const actualRpoPercent = Math.round(rawActual * 100) / 100;

    return {
      isValid: true,
      validationErrors: [
        `No verified RPO regulatory trajectory was found for Jurisdiction: '${input.jurisdiction}', Entity: '${input.entityType}', Period: '${input.compliancePeriod}'. Calculation shows actual achievement only.`,
      ],
      totalConsumptionMWh,
      renewableProcurementMWh,
      displayUnit: input.unit,
      applicableTargetPercent: null,
      actualRpoPercent,
      requiredProcurementMWh: 0,
      shortfallMWh: 0,
      surplusMWh: 0,
      complianceStatus: "TARGET_UNAVAILABLE",
      recEquivalentRequired: 0,
      estimatedRecCostRangeInr: null,
      regulatorySource: "Not Available in Central/SERC Registry",
      effectiveDate: "N/A",
      orderNumber: "N/A",
      applicabilityNotes:
        "Target information for this specific jurisdiction and period could not be retrieved from the backend API. Please consult your respective State Electricity Regulatory Commission (SERC).",
      calculationAssumptions,
    };
  }

  // Standard calculation
  const targetPercent = target.totalRpoPercent;
  const rawActual = (renewableProcurementMWh / totalConsumptionMWh) * 100;
  const actualRpoPercent = Math.round(rawActual * 100) / 100;

  const requiredProcurementMWh =
    Math.round(((totalConsumptionMWh * targetPercent) / 100) * 100) / 100;

  const rawShortfall = requiredProcurementMWh - renewableProcurementMWh;
  const shortfallMWh = rawShortfall > 0 ? Math.round(rawShortfall * 100) / 100 : 0;
  const surplusMWh =
    rawShortfall < 0 ? Math.round(Math.abs(rawShortfall) * 100) / 100 : 0;

  let complianceStatus: RPOComplianceStatus;
  if (shortfallMWh === 0) {
    complianceStatus = surplusMWh > 0 ? "SURPLUS" : "COMPLIANT";
  } else {
    complianceStatus = "SHORTFALL";
  }

  // CERC REC market equivalence: 1 REC = 1 MWh
  const recEquivalentRequired = Math.ceil(shortfallMWh);
  const estimatedRecCostRangeInr =
    shortfallMWh > 0
      ? {
          min: recEquivalentRequired * 1000, // CERC historical clearing range floor ~₹1,000
          max: recEquivalentRequired * 1500, // upper band ~₹1,500
        }
      : null;

  return {
    isValid: true,
    validationErrors: [],
    totalConsumptionMWh,
    renewableProcurementMWh,
    displayUnit: input.unit,
    applicableTargetPercent: targetPercent,
    targetBreakdown: {
      windRpoPercent: target.windRpoPercent,
      hydroRpoPercent: target.hydroRpoPercent,
      otherRpoPercent: target.otherRpoPercent,
    },
    actualRpoPercent,
    requiredProcurementMWh,
    shortfallMWh,
    surplusMWh,
    complianceStatus,
    recEquivalentRequired,
    estimatedRecCostRangeInr,
    regulatorySource: target.regulatorySource,
    effectiveDate: target.effectiveDate,
    orderNumber: target.orderNumber,
    applicabilityNotes: target.applicabilityNotes,
    calculationAssumptions,
  };
}
