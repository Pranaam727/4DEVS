import {
  SolarInput,
  SolarStateAssumption,
  SolarCalculationResult,
} from "../types/solar";

/**
 * Validates inputs for Rooftop Solar ROI calculations.
 */
export function validateSolarInput(input: SolarInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.state || input.state.trim() === "") {
    errors.push("Please select your State to retrieve official solar insolation benchmarks.");
  }

  if (typeof input.monthlyBillInr !== "number" || isNaN(input.monthlyBillInr)) {
    errors.push("Monthly electricity bill must be a valid number.");
  } else if (input.monthlyBillInr <= 0) {
    errors.push("Monthly electricity bill must be greater than zero.");
  }

  if (
    typeof input.electricityTariffInr !== "number" ||
    isNaN(input.electricityTariffInr)
  ) {
    errors.push("Electricity tariff must be a valid number.");
  } else if (input.electricityTariffInr <= 0) {
    errors.push("Electricity tariff must be greater than zero (₹/kWh).");
  }

  if (
    typeof input.rooftopAreaSqFt !== "number" ||
    isNaN(input.rooftopAreaSqFt)
  ) {
    errors.push("Available rooftop area must be a valid number.");
  } else if (input.rooftopAreaSqFt <= 0) {
    errors.push("Available rooftop area must be greater than zero sq. ft.");
  }

  if (
    input.proposedCapacityKW !== undefined &&
    input.proposedCapacityKW !== null &&
    (isNaN(input.proposedCapacityKW) || input.proposedCapacityKW <= 0)
  ) {
    errors.push("Proposed system capacity must be a positive number of kW.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates Central Financial Assistance (CFA) subsidy under PM Surya Ghar: Muft Bijli Yojana.
 * Verified Official Structure (Feb 2024 Gazette):
 * - Residential individual:
 *   - Up to 1 kW: ₹30,000
 *   - Up to 2 kW: ₹60,000 (₹30,000/kW)
 *   - Up to 3 kW: ₹78,000 (₹60,000 for 2 kW + ₹18,000 for 3rd kW)
 *   - Above 3 kW: Capped at ₹78,000
 * - Housing Society / RWA: ₹18,000/kW up to 500 kW
 * - Commercial / Industrial: ₹0 (No CFA)
 */
export function calculatePMSuryaGharSubsidy(
  capacityKW: number,
  category: SolarInput["consumerCategory"]
): number {
  if (capacityKW <= 0) return 0;

  if (category === "COMMERCIAL" || category === "INDUSTRIAL") {
    return 0; // Commercial and industrial are not eligible for central DBT subsidy
  }

  if (category === "HOUSING_SOCIETY") {
    const cappedCapacity = Math.min(capacityKW, 500);
    return Math.round(cappedCapacity * 18000);
  }

  // Individual Residential
  if (capacityKW <= 1) {
    return Math.round(capacityKW * 30000);
  } else if (capacityKW <= 2) {
    return Math.round(30000 + (capacityKW - 1) * 30000); // ₹60,000 at 2 kW
  } else if (capacityKW <= 3) {
    return Math.round(60000 + (capacityKW - 2) * 18000); // ₹78,000 at 3 kW
  } else {
    return 78000; // Hard cap of ₹78,000 for individual residential systems > 3 kW
  }
}

/**
 * Returns benchmark installation cost based on capacity slab (MNRE benchmark rates).
 */
export function getBenchmarkCostPerKW(
  capacityKW: number,
  costBrackets: SolarStateAssumption["benchmarkCostPerKw"]
): number {
  if (capacityKW <= 2) return costBrackets.upTo2kW;
  if (capacityKW <= 3) return costBrackets.upTo3kW;
  if (capacityKW <= 10) return costBrackets.upTo10kW;
  return costBrackets.above10kW;
}

/**
 * Calculates full Rooftop Solar ROI, sizing, generation, economics and environmental metrics.
 */
export function calculateSolarROI(
  input: SolarInput,
  assumption: SolarStateAssumption | null
): SolarCalculationResult {
  const validation = validateSolarInput(input);

  const formulasAndAssumptions = {
    formulaConsumption:
      "Monthly Consumption (kWh) = Monthly Bill (₹) / Tariff (₹/kWh); Annual Consumption = Monthly Consumption × 12",
    formulaRecommendedCapacity:
      "Recommended Capacity = min(Annual Consumption / Annual Specific Yield, Rooftop Area / 100 sq ft)",
    formulaGeneration:
      "Estimated Annual Generation (kWh) = Capacity (kW) × State Specific Yield (kWh/kW/year)",
    formulaCost:
      "Turnkey Cost (₹) = Capacity (kW) × Empanelled Benchmark Rate per kW",
    formulaSubsidy:
      "PM Surya Ghar Subsidy: ₹30,000/kW (1st-2nd kW) + ₹18,000 for 3rd kW (capped at ₹78,000 for >3 kW residential; ₹0 for C&I)",
    formulaPayback:
      "Simple Payback Period (years) = Net Outlay (Cost - Subsidy) / Annual Electricity Bill Savings",
    ceaEmissionFactorSource:
      "0.716 kg CO2/kWh as per Central Electricity Authority (CEA) Baseline Database for Indian Power Sector (Ver. 19/2023)",
    subsidyReference:
      "Ministry of New and Renewable Energy (MNRE) PM Surya Ghar: Muft Bijli Yojana Guidelines (February 2024)",
    disclaimer:
      "Projections are indicative estimates based on validated state insolation and Discom tariff benchmarks. Actual solar generation depends on orientation, shading, temperature, and local grid net-metering regulations. Savings are not legally guaranteed.",
  };

  if (!validation.isValid) {
    return {
      isValid: false,
      validationErrors: validation.errors,
      estimatedMonthlyConsumptionKWh: 0,
      estimatedAnnualConsumptionKWh: 0,
      maxCapacityFromAreaKW: 0,
      recommendedCapacityFromConsumptionKW: 0,
      recommendedSystemCapacityKW: 0,
      effectiveCapacityKW: 0,
      estimatedDailyGenerationKWh: 0,
      estimatedAnnualGenerationKWh: 0,
      estimatedAnnualSavingsInr: 0,
      estimatedMonthlySavingsInr: 0,
      estimatedGrossCostInr: 0,
      benchmarkCostPerKWInr: 0,
      applicableSubsidyInr: 0,
      netInvestmentInr: 0,
      paybackPeriodYears: 0,
      lifetime25YrSavingsInr: 0,
      annualCO2AvoidedTonnes: 0,
      lifetimeCO2AvoidedTonnes: 0,
      equivalentTreesPlanted: 0,
      formulasAndAssumptions,
      stateAssumptionUsed: assumption,
    };
  }

  if (!assumption) {
    return {
      isValid: false,
      validationErrors: [
        `Verified solar insolation and cost benchmarks for State: '${input.state}' are currently missing from the backend API. Please select a verified state or check back shortly.`,
      ],
      estimatedMonthlyConsumptionKWh: 0,
      estimatedAnnualConsumptionKWh: 0,
      maxCapacityFromAreaKW: 0,
      recommendedCapacityFromConsumptionKW: 0,
      recommendedSystemCapacityKW: 0,
      effectiveCapacityKW: 0,
      estimatedDailyGenerationKWh: 0,
      estimatedAnnualGenerationKWh: 0,
      estimatedAnnualSavingsInr: 0,
      estimatedMonthlySavingsInr: 0,
      estimatedGrossCostInr: 0,
      benchmarkCostPerKWInr: 0,
      applicableSubsidyInr: 0,
      netInvestmentInr: 0,
      paybackPeriodYears: 0,
      lifetime25YrSavingsInr: 0,
      annualCO2AvoidedTonnes: 0,
      lifetimeCO2AvoidedTonnes: 0,
      equivalentTreesPlanted: 0,
      formulasAndAssumptions,
      stateAssumptionUsed: null,
    };
  }

  // 1. Consumption estimation
  const monthlyConsumptionKWh = input.monthlyBillInr / input.electricityTariffInr;
  const annualConsumptionKWh = monthlyConsumptionKWh * 12;

  // 2. Sizing benchmarks
  // Area needed: 100 sq ft per kW (typical crystalline silicon)
  const areaPerKw = assumption.areaRequiredPerKW_SqFt || 100;
  const maxCapacityFromAreaKW =
    Math.round((input.rooftopAreaSqFt / areaPerKw) * 10) / 10;

  // Capacity to offset 100% of annual consumption
  const specificYield = assumption.annualGenerationPerKW || 1450;
  const recommendedCapacityFromConsumptionKW =
    Math.round((annualConsumptionKWh / specificYield) * 10) / 10;

  // Optimal system capacity: minimum of consumption need and available roof space
  const rawOptimal = Math.min(
    recommendedCapacityFromConsumptionKW,
    maxCapacityFromAreaKW
  );
  // Round to 1 decimal place, minimum 0.5 kW
  const recommendedSystemCapacityKW = Math.max(
    0.5,
    Math.round(rawOptimal * 2) / 2
  );

  // Effective capacity evaluated (user proposed override or calculated recommendation)
  const effectiveCapacityKW =
    input.proposedCapacityKW && input.proposedCapacityKW > 0
      ? input.proposedCapacityKW
      : recommendedSystemCapacityKW;

  // 3. Generation estimation
  const annualGenerationKWh = Math.round(effectiveCapacityKW * specificYield);
  const dailyGenerationKWh = Math.round((annualGenerationKWh / 365) * 10) / 10;

  // 4. Financial savings:
  // Offset self-consumption at retail tariff; surplus (if any) at APPC net-metering rate (~₹3.00/kWh)
  const selfConsumedKWh = Math.min(annualGenerationKWh, annualConsumptionKWh);
  const surplusExportKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
  const appcExportTariff = 3.0; // ₹3.00 / kWh average Discom surplus feed-in credit

  const annualSavingsInr = Math.round(
    selfConsumedKWh * input.electricityTariffInr + surplusExportKWh * appcExportTariff
  );
  const monthlySavingsInr = Math.round(annualSavingsInr / 12);

  // 5. System Turnkey Cost
  const benchmarkCostPerKWInr = getBenchmarkCostPerKW(
    effectiveCapacityKW,
    assumption.benchmarkCostPerKw
  );
  const grossCostInr = Math.round(effectiveCapacityKW * benchmarkCostPerKWInr);

  // 6. PM Surya Ghar Subsidy
  const applicableSubsidyInr = calculatePMSuryaGharSubsidy(
    effectiveCapacityKW,
    input.consumerCategory
  );

  // 7. Net Investment & Payback
  const netInvestmentInr = Math.max(0, grossCostInr - applicableSubsidyInr);
  const paybackPeriodYears =
    annualSavingsInr > 0
      ? Math.round((netInvestmentInr / annualSavingsInr) * 10) / 10
      : 0;

  // 8. 25-Year Cumulative Savings:
  // Solar degradation: 0.7%/year; Grid tariff escalation: 3%/year
  let lifetime25YrSavingsInr = 0;
  let totalLifetimeGenerationKWh = 0;
  let currentGeneration = annualGenerationKWh;
  let currentTariff = input.electricityTariffInr;

  for (let year = 1; year <= 25; year++) {
    const yrSelfConsumed = Math.min(currentGeneration, annualConsumptionKWh);
    const yrSurplus = Math.max(0, currentGeneration - annualConsumptionKWh);
    const yrSavings = yrSelfConsumed * currentTariff + yrSurplus * appcExportTariff;
    lifetime25YrSavingsInr += yrSavings;
    totalLifetimeGenerationKWh += currentGeneration;

    // Apply annual factors
    currentGeneration *= 0.993; // 0.7% degradation
    currentTariff *= 1.03; // 3% inflation
  }
  lifetime25YrSavingsInr = Math.round(lifetime25YrSavingsInr - netInvestmentInr);

  // 9. Environmental impact (CEA emission factor = 0.716 kg CO2/kWh)
  const emissionFactor = assumption.gridEmissionFactorKgPerKWh || 0.716;
  const annualCO2AvoidedTonnes =
    Math.round(((annualGenerationKWh * emissionFactor) / 1000) * 100) / 100;
  const lifetimeCO2AvoidedTonnes =
    Math.round(((totalLifetimeGenerationKWh * emissionFactor) / 1000) * 100) / 100;
  // 1 tree absorbs ~20 kg CO2 / year
  const equivalentTreesPlanted = Math.round(
    (annualCO2AvoidedTonnes * 1000) / 20
  );

  return {
    isValid: true,
    validationErrors: [],
    estimatedMonthlyConsumptionKWh: Math.round(monthlyConsumptionKWh),
    estimatedAnnualConsumptionKWh: Math.round(annualConsumptionKWh),
    maxCapacityFromAreaKW,
    recommendedCapacityFromConsumptionKW,
    recommendedSystemCapacityKW,
    effectiveCapacityKW,
    estimatedDailyGenerationKWh: dailyGenerationKWh,
    estimatedAnnualGenerationKWh: annualGenerationKWh,
    estimatedAnnualSavingsInr: annualSavingsInr,
    estimatedMonthlySavingsInr: monthlySavingsInr,
    estimatedGrossCostInr: grossCostInr,
    benchmarkCostPerKWInr,
    applicableSubsidyInr,
    netInvestmentInr,
    paybackPeriodYears,
    lifetime25YrSavingsInr,
    annualCO2AvoidedTonnes,
    lifetimeCO2AvoidedTonnes,
    equivalentTreesPlanted,
    formulasAndAssumptions,
    stateAssumptionUsed: assumption,
  };
}
