import {
  calculateRPOCompliance,
  findMatchingTarget,
  validateRpoInput,
  convertToMWh,
} from "../lib/calculations/rpo.ts";
import {
  calculateSolarROI,
  calculatePMSuryaGharSubsidy,
  getBenchmarkCostPerKW,
  validateSolarInput,
} from "../lib/calculations/solar.ts";
import {
  filterGreenJobs,
  extractJobFilterOptions,
} from "../lib/calculations/jobs.ts";

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

console.log("=== RUNNING INDIA GREEN GRID TEST SUITE (MEMBER 3) ===\n");

// ----------------------------------------------------
// 1. RPO TEST SUITE
// ----------------------------------------------------
console.log("--- 1. Testing RPO Compliance Calculations ---");

// Unit conversions
assert(convertToMWh(1000000, "kWh") === 1000, "1,000,000 kWh converts to 1,000 MWh");
assert(convertToMWh(10, "MU") === 10000, "10 MU converts to 10,000 MWh");
assert(convertToMWh(2500, "MWh") === 2500, "2,500 MWh remains 2,500 MWh");
assert(convertToMWh(-100, "MWh") === 0, "Negative values convert safely to 0");

// Validation
const invalidRpo1 = validateRpoInput({
  totalConsumption: -500,
  renewableProcurement: 100,
  unit: "MWh",
  entityType: "DISCOM",
  jurisdiction: "NATIONAL",
  compliancePeriod: "2024-25",
});
assert(!invalidRpo1.isValid && invalidRpo1.errors.length > 0, "Flags negative consumption as invalid");

const invalidRpo2 = validateRpoInput({
  totalConsumption: 1000,
  renewableProcurement: -50,
  unit: "MWh",
  entityType: "DISCOM",
  jurisdiction: "NATIONAL",
  compliancePeriod: "2024-25",
});
assert(!invalidRpo2.isValid, "Flags negative procurement as invalid");

// Synthetic RPO Target
const syntheticTarget = {
  id: "test-mop-24-25",
  jurisdiction: "NATIONAL",
  jurisdictionName: "National Synthetic",
  entityType: "DISCOM",
  entityTypeName: "DISCOM Synthetic",
  compliancePeriod: "2024-25",
  windRpoPercent: 6.94,
  hydroRpoPercent: 0.38,
  otherRpoPercent: 22.59,
  totalRpoPercent: 29.91,
  regulatorySource: "MoP Trajectory Order",
  effectiveDate: "2024-04-01",
  orderNumber: "TEST-2024",
  applicabilityNotes: "Test",
  isVerified: true,
};

// Shortfall calculation
const shortfallInput = {
  totalConsumption: 10000,
  renewableProcurement: 2000, // 20% vs 29.91% target
  unit: "MWh",
  entityType: "DISCOM",
  jurisdiction: "NATIONAL",
  compliancePeriod: "2024-25",
};
const rpoRes1 = calculateRPOCompliance(shortfallInput, syntheticTarget);
assert(rpoRes1.actualRpoPercent === 20.0, "Actual RPO percentage = 20.00%");
assert(rpoRes1.requiredProcurementMWh === 2991, "Required procurement = 2,991 MWh (29.91% of 10,000)");
assert(rpoRes1.shortfallMWh === 991, "Shortfall = 991 MWh");
assert(rpoRes1.complianceStatus === "SHORTFALL", "Status = SHORTFALL");
assert(rpoRes1.recEquivalentRequired === 991, "REC equivalent required = 991 RECs");
assert(rpoRes1.estimatedRecCostRangeInr.min === 991000, "REC min cost estimate = ₹9,91,000");

// Surplus calculation
const surplusInput = {
  totalConsumption: 10000,
  renewableProcurement: 3500, // 35% vs 29.91% target
  unit: "MWh",
  entityType: "DISCOM",
  jurisdiction: "NATIONAL",
  compliancePeriod: "2024-25",
};
const rpoRes2 = calculateRPOCompliance(surplusInput, syntheticTarget);
assert(rpoRes2.actualRpoPercent === 35.0, "Actual RPO percentage = 35.00%");
assert(rpoRes2.shortfallMWh === 0, "Shortfall = 0 on surplus");
assert(rpoRes2.surplusMWh === 509, "Surplus = 509 MWh");
assert(rpoRes2.complianceStatus === "SURPLUS", "Status = SURPLUS");

// Zero consumption
const zeroInput = {
  totalConsumption: 0,
  renewableProcurement: 0,
  unit: "MWh",
  entityType: "DISCOM",
  jurisdiction: "NATIONAL",
  compliancePeriod: "2024-25",
};
const rpoRes3 = calculateRPOCompliance(zeroInput, syntheticTarget);
assert(rpoRes3.complianceStatus === "ZERO_CONSUMPTION", "Status = ZERO_CONSUMPTION");
assert(rpoRes3.requiredProcurementMWh === 0, "Required procurement = 0 MWh on zero load");

// Missing target
const missingTargetInput = {
  totalConsumption: 5000,
  renewableProcurement: 1000,
  unit: "MWh",
  entityType: "UNKNOWN",
  jurisdiction: "UNKNOWN",
  compliancePeriod: "2099",
};
const rpoRes4 = calculateRPOCompliance(missingTargetInput, null);
assert(rpoRes4.complianceStatus === "TARGET_UNAVAILABLE", "Status = TARGET_UNAVAILABLE when target missing");
assert(rpoRes4.actualRpoPercent === 20.0, "Computes actual RPO achievement (20%) even when target missing");

// ----------------------------------------------------
// 2. SOLAR ROI TEST SUITE
// ----------------------------------------------------
console.log("\n--- 2. Testing Rooftop Solar ROI Calculations ---");

// Validation
assert(!validateSolarInput({ state: "KA", monthlyBillInr: 0, electricityTariffInr: 7, rooftopAreaSqFt: 300, consumerCategory: "RESIDENTIAL" }).isValid, "Rejects bill <= 0");
assert(!validateSolarInput({ state: "KA", monthlyBillInr: 3000, electricityTariffInr: 0, rooftopAreaSqFt: 300, consumerCategory: "RESIDENTIAL" }).isValid, "Rejects tariff <= 0");
assert(!validateSolarInput({ state: "KA", monthlyBillInr: 3000, electricityTariffInr: 7, rooftopAreaSqFt: 0, consumerCategory: "RESIDENTIAL" }).isValid, "Rejects area <= 0");

// PM Surya Ghar Subsidy
assert(calculatePMSuryaGharSubsidy(1, "RESIDENTIAL") === 30000, "PM Surya Ghar 1 kW = ₹30,000");
assert(calculatePMSuryaGharSubsidy(2, "RESIDENTIAL") === 60000, "PM Surya Ghar 2 kW = ₹60,000");
assert(calculatePMSuryaGharSubsidy(3, "RESIDENTIAL") === 78000, "PM Surya Ghar 3 kW = ₹78,000");
assert(calculatePMSuryaGharSubsidy(5, "RESIDENTIAL") === 78000, "PM Surya Ghar >3 kW capped at ₹78,000");
assert(calculatePMSuryaGharSubsidy(10, "HOUSING_SOCIETY") === 180000, "Housing society = ₹18,000/kW");
assert(calculatePMSuryaGharSubsidy(5, "COMMERCIAL") === 0, "Commercial subsidy = ₹0");
assert(calculatePMSuryaGharSubsidy(50, "INDUSTRIAL") === 0, "Industrial subsidy = ₹0");

// Solar sizing and financial model
const syntheticSolarAssumption = {
  stateCode: "KARNATAKA",
  stateName: "Karnataka",
  annualGenerationPerKW: 1500,
  dailySunHours: 4.5,
  benchmarkTariffInr: 7.0,
  areaRequiredPerKW_SqFt: 100,
  benchmarkCostPerKw: { upTo2kW: 55000, upTo3kW: 52000, upTo10kW: 48000, above10kW: 45000 },
  subsidySchemeName: "PM Surya Ghar",
  subsidyAvailable: true,
  subsidyRules: { residential1kW: 30000, residential2kW: 60000, residential3kW: 78000, residentialMaxCap: 78000, housingSocietyPerKW: 18000, commercialEligible: false },
  gridEmissionFactorKgPerKWh: 0.716,
  dataSource: "NISE / CEA",
  lastUpdated: "2024-01-01",
};

const solarInput = {
  state: "KARNATAKA",
  monthlyBillInr: 3500, // 500 units/mo => 6000 units/yr => 4.0 kW by consumption
  electricityTariffInr: 7.0,
  rooftopAreaSqFt: 300, // 300 sq ft => max 3.0 kW
  consumerCategory: "RESIDENTIAL",
};

const solarRes = calculateSolarROI(solarInput, syntheticSolarAssumption);
assert(solarRes.isValid === true, "Solar ROI result is valid");
assert(solarRes.effectiveCapacityKW === 3.0, "Optimal capacity sizing = 3.0 kW (area constrained)");
assert(solarRes.estimatedAnnualGenerationKWh === 4500, "Annual generation = 4,500 kWh (3 kW * 1500)");
assert(solarRes.estimatedAnnualSavingsInr === 31500, "Annual savings = ₹31,500");
assert(solarRes.estimatedGrossCostInr === 156000, "Gross cost = ₹156,000 (3 kW * 52,000)");
assert(solarRes.applicableSubsidyInr === 78000, "Verified subsidy = ₹78,000");
assert(solarRes.netInvestmentInr === 78000, "Net investment = ₹78,000");
assert(solarRes.paybackPeriodYears === 2.5, "Simple payback period = 2.5 years");
assert(solarRes.annualCO2AvoidedTonnes === 3.22, "Annual CO2 avoided = 3.22 tonnes");

// Missing assumption handling
const solarMissingRes = calculateSolarROI(solarInput, null);
assert(solarMissingRes.isValid === false, "Handles missing state assumption safely");
assert(solarMissingRes.validationErrors.length > 0, "Provides clear explanatory error message without fabricating data");

// ----------------------------------------------------
// 3. GREEN JOBS TEST SUITE
// ----------------------------------------------------
console.log("\n--- 3. Testing Green Jobs Filter & Search Engine ---");

const syntheticJobs = [
  {
    id: "job-1",
    title: "Senior Solar Engineer",
    organization: "SECI",
    organizationType: "Public Sector Undertaking (PSU)",
    location: "New Delhi",
    state: "Delhi",
    category: "Solar Energy",
    employmentType: "Full-Time",
    experienceLevel: "Mid Level",
    postingDate: "2024-04-18",
    applicationDeadline: "2024-05-30",
    originalSource: "SECI Careers",
    sourceUrl: "https://www.seci.co.in/careers",
    retrievalTimestamp: "2024-06-15T10:00:00Z",
    descriptionSnippet: "PVSyst design and engineering.",
    keySkills: ["PVSyst", "AutoCAD"],
    isVerifiedListing: true,
  },
  {
    id: "job-2",
    title: "Offshore Wind Scientist",
    organization: "NIWE",
    organizationType: "Autonomous Body",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    category: "Wind Energy",
    employmentType: "Contract / Project-Based",
    experienceLevel: "Entry Level",
    postingDate: "2024-05-20",
    applicationDeadline: null,
    originalSource: "NIWE Careers",
    sourceUrl: "https://niwe.res.in/careers.php",
    retrievalTimestamp: "2024-06-15T10:00:00Z",
    descriptionSnippet: "LiDAR studies for offshore wind.",
    keySkills: ["LiDAR", "WAsP"],
    isVerifiedListing: true,
  },
];

// Search by title
const searchRes1 = filterGreenJobs(syntheticJobs, { searchQuery: "solar", selectedLocation: "ALL", selectedCategory: "ALL" });
assert(searchRes1.length === 1 && searchRes1[0].id === "job-1", "Searches by title successfully");

// Search by skill
const searchRes2 = filterGreenJobs(syntheticJobs, { searchQuery: "lidar", selectedLocation: "ALL", selectedCategory: "ALL" });
assert(searchRes2.length === 1 && searchRes2[0].id === "job-2", "Searches by key skills token successfully");

// Filter by location
const locRes = filterGreenJobs(syntheticJobs, { searchQuery: "", selectedLocation: "Chennai", selectedCategory: "ALL" });
assert(locRes.length === 1 && locRes[0].id === "job-2", "Filters by location successfully");

// Filter by category
const catRes = filterGreenJobs(syntheticJobs, { searchQuery: "", selectedLocation: "ALL", selectedCategory: "Wind Energy" });
assert(catRes.length === 1 && catRes[0].id === "job-2", "Filters by category successfully");

// Empty filter result
const emptyRes = filterGreenJobs(syntheticJobs, { searchQuery: "NonExistentTerm999", selectedLocation: "ALL", selectedCategory: "ALL" });
assert(emptyRes.length === 0, "Returns empty list cleanly when no job matches");

// Listing links and metadata check
syntheticJobs.forEach((j) => {
  assert(j.sourceUrl.startsWith("https://"), `Listing ${j.id} has verified https link`);
  assert(j.retrievalTimestamp.length > 0, `Listing ${j.id} has verification timestamp`);
});

console.log(`\n====================================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`====================================================\n`);

if (failed > 0) {
  process.exit(1);
}
