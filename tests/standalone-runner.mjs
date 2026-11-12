// Self-contained test runner that validates all Member 3 calculations and logic
// Tests RPO, Solar ROI, and Green Jobs filtering with synthetic values

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
    passed++;
  }
}

console.log("========================================================");
console.log(" INDIA GREEN GRID — MEMBER 3 TEST VALIDATION SUITE");
console.log("========================================================\n");

// ----------------------------------------------------
// 1. RPO CALCULATIONS LOGIC
// ----------------------------------------------------
console.log("--- [MODULE 1: RPO COMPLIANCE TRACKER] ---");

function convertToMWh(value, unit) {
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

function validateRpoInput(input) {
  const errors = [];
  if (typeof input.totalConsumption !== "number" || isNaN(input.totalConsumption)) {
    errors.push("Total electricity consumption must be a valid number.");
  } else if (input.totalConsumption < 0) {
    errors.push("Total electricity consumption cannot be negative.");
  }
  if (typeof input.renewableProcurement !== "number" || isNaN(input.renewableProcurement)) {
    errors.push("Renewable electricity procurement must be a valid number.");
  } else if (input.renewableProcurement < 0) {
    errors.push("Renewable electricity procurement cannot be negative.");
  }
  if (!input.entityType) errors.push("Please select an applicable entity type.");
  if (!input.jurisdiction) errors.push("Please select an applicable regulatory jurisdiction.");
  if (!input.compliancePeriod) errors.push("Please select a compliance period.");
  return { isValid: errors.length === 0, errors };
}

function calculateRPOCompliance(input, target) {
  const validation = validateRpoInput(input);
  if (!validation.isValid) {
    return { isValid: false, errors: validation.errors, complianceStatus: "INVALID_INPUT" };
  }

  const totalConsumptionMWh = convertToMWh(input.totalConsumption, input.unit);
  const renewableProcurementMWh = convertToMWh(input.renewableProcurement, input.unit);

  if (totalConsumptionMWh === 0) {
    return {
      isValid: true,
      totalConsumptionMWh: 0,
      renewableProcurementMWh,
      applicableTargetPercent: target ? target.totalRpoPercent : null,
      actualRpoPercent: 0,
      requiredProcurementMWh: 0,
      shortfallMWh: 0,
      surplusMWh: renewableProcurementMWh,
      complianceStatus: "ZERO_CONSUMPTION",
      recEquivalentRequired: 0,
    };
  }

  if (!target) {
    const actualRpoPercent = Math.round((renewableProcurementMWh / totalConsumptionMWh) * 10000) / 100;
    return {
      isValid: true,
      totalConsumptionMWh,
      renewableProcurementMWh,
      applicableTargetPercent: null,
      actualRpoPercent,
      requiredProcurementMWh: 0,
      shortfallMWh: 0,
      surplusMWh: 0,
      complianceStatus: "TARGET_UNAVAILABLE",
      recEquivalentRequired: 0,
    };
  }

  const targetPercent = target.totalRpoPercent;
  const actualRpoPercent = Math.round((renewableProcurementMWh / totalConsumptionMWh) * 10000) / 100;
  const requiredProcurementMWh = Math.round(((totalConsumptionMWh * targetPercent) / 100) * 100) / 100;
  const rawShortfall = requiredProcurementMWh - renewableProcurementMWh;
  const shortfallMWh = rawShortfall > 0 ? Math.round(rawShortfall * 100) / 100 : 0;
  const surplusMWh = rawShortfall < 0 ? Math.round(Math.abs(rawShortfall) * 100) / 100 : 0;

  let complianceStatus = "COMPLIANT";
  if (shortfallMWh > 0) complianceStatus = "SHORTFALL";
  else if (surplusMWh > 0) complianceStatus = "SURPLUS";

  const recEquivalentRequired = Math.ceil(shortfallMWh);

  return {
    isValid: true,
    totalConsumptionMWh,
    renewableProcurementMWh,
    applicableTargetPercent: targetPercent,
    actualRpoPercent,
    requiredProcurementMWh,
    shortfallMWh,
    surplusMWh,
    complianceStatus,
    recEquivalentRequired,
  };
}

// Tests: RPO
assert(convertToMWh(500000, "kWh") === 500, "Converts 500,000 kWh to 500 MWh");
assert(convertToMWh(15, "MU") === 15000, "Converts 15 MU to 15,000 MWh");
assert(validateRpoInput({ totalConsumption: -10, renewableProcurement: 0, entityType: "A", jurisdiction: "B", compliancePeriod: "C" }).isValid === false, "Validates negative consumption");

const syntheticTarget = { totalRpoPercent: 29.91 };
const shortfallCalc = calculateRPOCompliance(
  { totalConsumption: 10000, renewableProcurement: 2000, unit: "MWh", entityType: "DISCOM", jurisdiction: "NATIONAL", compliancePeriod: "2024-25" },
  syntheticTarget
);
assert(shortfallCalc.actualRpoPercent === 20.0, "Calculates Actual RPO (%) = 20.00%");
assert(shortfallCalc.requiredProcurementMWh === 2991, "Calculates Required = 2,991 MWh (29.91% of 10,000)");
assert(shortfallCalc.shortfallMWh === 991, "Calculates Shortfall = 991 MWh (2,991 - 2,000)");
assert(shortfallCalc.complianceStatus === "SHORTFALL", "Accurately labels SHORTFALL status");
assert(shortfallCalc.recEquivalentRequired === 991, "Accurately determines 991 RECs needed");

const surplusCalc = calculateRPOCompliance(
  { totalConsumption: 10000, renewableProcurement: 3200, unit: "MWh", entityType: "DISCOM", jurisdiction: "NATIONAL", compliancePeriod: "2024-25" },
  syntheticTarget
);
assert(surplusCalc.actualRpoPercent === 32.0, "Calculates Actual RPO (%) = 32.00%");
assert(surplusCalc.shortfallMWh === 0, "Calculates 0 shortfall on surplus");
assert(surplusCalc.surplusMWh === 209, "Calculates Surplus = 209 MWh");
assert(surplusCalc.complianceStatus === "SURPLUS", "Accurately labels SURPLUS status");

const zeroCalc = calculateRPOCompliance(
  { totalConsumption: 0, renewableProcurement: 0, unit: "MWh", entityType: "DISCOM", jurisdiction: "NATIONAL", compliancePeriod: "2024-25" },
  syntheticTarget
);
assert(zeroCalc.complianceStatus === "ZERO_CONSUMPTION", "Handles zero consumption without divide-by-zero error");
assert(zeroCalc.requiredProcurementMWh === 0, "Required procurement is 0 on zero consumption");

const missingCalc = calculateRPOCompliance(
  { totalConsumption: 5000, renewableProcurement: 1000, unit: "MWh", entityType: "UNKNOWN", jurisdiction: "UNKNOWN", compliancePeriod: "2099" },
  null
);
assert(missingCalc.complianceStatus === "TARGET_UNAVAILABLE", "Labels TARGET_UNAVAILABLE honestly when regulation missing");
assert(missingCalc.actualRpoPercent === 20.0, "Computes actual RPO achievement even when target missing");


// ----------------------------------------------------
// 2. SOLAR ROI CALCULATIONS LOGIC
// ----------------------------------------------------
console.log("\n--- [MODULE 2: ROOFTOP SOLAR ROI CALCULATOR] ---");

function calculatePMSuryaGharSubsidy(capacityKW, category) {
  if (capacityKW <= 0) return 0;
  if (category === "COMMERCIAL" || category === "INDUSTRIAL") return 0;
  if (category === "HOUSING_SOCIETY") {
    return Math.round(Math.min(capacityKW, 500) * 18000);
  }
  if (capacityKW <= 1) return Math.round(capacityKW * 30000);
  if (capacityKW <= 2) return Math.round(30000 + (capacityKW - 1) * 30000);
  if (capacityKW <= 3) return Math.round(60000 + (capacityKW - 2) * 18000);
  return 78000;
}

function calculateSolarROI(input, assumption) {
  if (!assumption) {
    return { isValid: false, error: "Missing state assumption" };
  }
  const monthlyConsumptionKWh = input.monthlyBillInr / input.electricityTariffInr;
  const annualConsumptionKWh = monthlyConsumptionKWh * 12;
  const maxCapacityFromAreaKW = Math.round((input.rooftopAreaSqFt / assumption.areaRequiredPerKW_SqFt) * 10) / 10;
  const recommendedCapacityFromConsumptionKW = Math.round((annualConsumptionKWh / assumption.annualGenerationPerKW) * 10) / 10;
  const rawOptimal = Math.min(recommendedCapacityFromConsumptionKW, maxCapacityFromAreaKW);
  const recommendedSystemCapacityKW = Math.max(0.5, Math.round(rawOptimal * 2) / 2);
  const effectiveCapacityKW = input.proposedCapacityKW && input.proposedCapacityKW > 0 ? input.proposedCapacityKW : recommendedSystemCapacityKW;

  const annualGenerationKWh = Math.round(effectiveCapacityKW * assumption.annualGenerationPerKW);
  const selfConsumedKWh = Math.min(annualGenerationKWh, annualConsumptionKWh);
  const surplusKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
  const annualSavingsInr = Math.round(selfConsumedKWh * input.electricityTariffInr + surplusKWh * 3.0);

  const costPerKw = effectiveCapacityKW <= 2 ? assumption.benchmarkCostPerKw.upTo2kW : (effectiveCapacityKW <= 3 ? assumption.benchmarkCostPerKw.upTo3kW : assumption.benchmarkCostPerKw.upTo10kW);
  const grossCostInr = Math.round(effectiveCapacityKW * costPerKw);
  const applicableSubsidyInr = calculatePMSuryaGharSubsidy(effectiveCapacityKW, input.consumerCategory);
  const netInvestmentInr = Math.max(0, grossCostInr - applicableSubsidyInr);
  const paybackPeriodYears = annualSavingsInr > 0 ? Math.round((netInvestmentInr / annualSavingsInr) * 10) / 10 : 0;
  const annualCO2AvoidedTonnes = Math.round(((annualGenerationKWh * assumption.gridEmissionFactorKgPerKWh) / 1000) * 100) / 100;

  return {
    isValid: true,
    effectiveCapacityKW,
    annualGenerationKWh,
    annualSavingsInr,
    grossCostInr,
    applicableSubsidyInr,
    netInvestmentInr,
    paybackPeriodYears,
    annualCO2AvoidedTonnes,
  };
}

// Tests: Solar Subsidy
assert(calculatePMSuryaGharSubsidy(1, "RESIDENTIAL") === 30000, "PM Surya Ghar 1 kW = ₹30,000");
assert(calculatePMSuryaGharSubsidy(2, "RESIDENTIAL") === 60000, "PM Surya Ghar 2 kW = ₹60,000");
assert(calculatePMSuryaGharSubsidy(3, "RESIDENTIAL") === 78000, "PM Surya Ghar 3 kW = ₹78,000");
assert(calculatePMSuryaGharSubsidy(4, "RESIDENTIAL") === 78000, "PM Surya Ghar 4 kW capped at ₹78,000");
assert(calculatePMSuryaGharSubsidy(5, "COMMERCIAL") === 0, "Commercial subsidy = ₹0");

// Tests: Solar ROI Calculation
const testAssumption = {
  annualGenerationPerKW: 1500,
  areaRequiredPerKW_SqFt: 100,
  benchmarkCostPerKw: { upTo2kW: 55000, upTo3kW: 52000, upTo10kW: 48000 },
  gridEmissionFactorKgPerKWh: 0.716,
};
const testSolarInput = {
  monthlyBillInr: 3500,
  electricityTariffInr: 7.0,
  rooftopAreaSqFt: 300,
  consumerCategory: "RESIDENTIAL",
};
const solarRes = calculateSolarROI(testSolarInput, testAssumption);
assert(solarRes.effectiveCapacityKW === 3.0, "Optimal sizing = 3.0 kW");
assert(solarRes.annualGenerationKWh === 4500, "Annual generation = 4,500 kWh");
assert(solarRes.annualSavingsInr === 31500, "Annual savings = ₹31,500");
assert(solarRes.grossCostInr === 156000, "Gross cost = ₹156,000");
assert(solarRes.applicableSubsidyInr === 78000, "Applicable subsidy = ₹78,000");
assert(solarRes.netInvestmentInr === 78000, "Net investment = ₹78,000");
assert(solarRes.paybackPeriodYears === 2.5, "Payback = 2.5 years");
assert(solarRes.annualCO2AvoidedTonnes === 3.22, "CO2 avoided = 3.22 tonnes");

// Missing assumption test
const missingSolarRes = calculateSolarROI(testSolarInput, null);
assert(missingSolarRes.isValid === false, "Handles missing state assumptions honestly without fabricating results");


// ----------------------------------------------------
// 3. GREEN JOBS FILTERING LOGIC
// ----------------------------------------------------
console.log("\n--- [MODULE 3: GREEN JOBS BOARD] ---");

function filterGreenJobs(jobs, filters) {
  if (!jobs || !Array.isArray(jobs)) return [];
  return jobs.filter((job) => {
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.trim().toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.organization.toLowerCase().includes(q) ||
        job.keySkills.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.selectedLocation && filters.selectedLocation !== "ALL") {
      if (!job.location.toLowerCase().includes(filters.selectedLocation.toLowerCase())) return false;
    }
    if (filters.selectedCategory && filters.selectedCategory !== "ALL") {
      if (job.category.toLowerCase() !== filters.selectedCategory.toLowerCase()) return false;
    }
    return true;
  });
}

const testJobs = [
  { id: "1", title: "Senior Solar Engineer", organization: "SECI", location: "New Delhi", category: "Solar Energy", keySkills: ["PVSyst"], sourceUrl: "https://seci.co.in/careers", retrievalTimestamp: "2024-06-15" },
  { id: "2", title: "Wind Project Scientist", organization: "NIWE", location: "Chennai", category: "Wind Energy", keySkills: ["LiDAR"], sourceUrl: "https://niwe.res.in/careers", retrievalTimestamp: "2024-06-15" },
];

assert(filterGreenJobs(testJobs, { searchQuery: "solar", selectedLocation: "ALL", selectedCategory: "ALL" }).length === 1, "Searches by title keyword");
assert(filterGreenJobs(testJobs, { searchQuery: "lidar", selectedLocation: "ALL", selectedCategory: "ALL" }).length === 1, "Searches by skill keyword");
assert(filterGreenJobs(testJobs, { searchQuery: "", selectedLocation: "Chennai", selectedCategory: "ALL" }).length === 1, "Filters by location");
assert(filterGreenJobs(testJobs, { searchQuery: "", selectedLocation: "ALL", selectedCategory: "Wind Energy" }).length === 1, "Filters by category");
assert(filterGreenJobs(testJobs, { searchQuery: "NonExistent", selectedLocation: "ALL", selectedCategory: "ALL" }).length === 0, "Returns empty list when no matches exist");

console.log("\n========================================================");
console.log(` ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
