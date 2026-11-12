import { describe, it, expect } from "vitest";
import {
  calculateSolarROI,
  calculatePMSuryaGharSubsidy,
  getBenchmarkCostPerKW,
  validateSolarInput,
} from "../lib/calculations/solar";
import { SolarInput, SolarStateAssumption } from "../lib/types/solar";

// Synthetic test assumption strictly for isolated automated tests
const SYNTHETIC_ASSUMPTION: SolarStateAssumption = {
  stateCode: "TEST_STATE",
  stateName: "Synthetic Test State",
  annualGenerationPerKW: 1500, // 1500 kWh/kW/year
  dailySunHours: 4.5,
  benchmarkTariffInr: 7.0, // ₹7.00/kWh
  areaRequiredPerKW_SqFt: 100, // 100 sq ft / kW
  benchmarkCostPerKw: {
    upTo2kW: 55000,
    upTo3kW: 52000,
    upTo10kW: 48000,
    above10kW: 45000,
  },
  subsidySchemeName: "Synthetic PM Surya Ghar",
  subsidyAvailable: true,
  subsidyRules: {
    residential1kW: 30000,
    residential2kW: 60000,
    residential3kW: 78000,
    residentialMaxCap: 78000,
    housingSocietyPerKW: 18000,
    commercialEligible: false,
  },
  gridEmissionFactorKgPerKWh: 0.716,
  dataSource: "Synthetic Automated Test Fixture",
  lastUpdated: "2024-01-01",
};

describe("Rooftop Solar ROI Calculations Engine", () => {
  describe("Input Validation", () => {
    it("flags non-positive monthly bill as invalid", () => {
      const input: SolarInput = {
        state: "TEST_STATE",
        monthlyBillInr: 0,
        electricityTariffInr: 7.0,
        rooftopAreaSqFt: 300,
        consumerCategory: "RESIDENTIAL",
      };
      const validation = validateSolarInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Monthly electricity bill must be greater than zero."
      );
    });

    it("flags negative or zero electricity tariff as invalid", () => {
      const input: SolarInput = {
        state: "TEST_STATE",
        monthlyBillInr: 3000,
        electricityTariffInr: -2.0,
        rooftopAreaSqFt: 300,
        consumerCategory: "RESIDENTIAL",
      };
      const validation = validateSolarInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Electricity tariff must be greater than zero (₹/kWh)."
      );
    });

    it("flags zero rooftop area as invalid", () => {
      const input: SolarInput = {
        state: "TEST_STATE",
        monthlyBillInr: 3000,
        electricityTariffInr: 7.0,
        rooftopAreaSqFt: 0,
        consumerCategory: "RESIDENTIAL",
      };
      const validation = validateSolarInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Available rooftop area must be greater than zero sq. ft."
      );
    });
  });

  describe("PM Surya Ghar Subsidy Rules", () => {
    it("calculates ₹30,000 for 1 kW residential system", () => {
      expect(calculatePMSuryaGharSubsidy(1, "RESIDENTIAL")).toBe(30000);
    });

    it("calculates ₹60,000 for 2 kW residential system", () => {
      expect(calculatePMSuryaGharSubsidy(2, "RESIDENTIAL")).toBe(60000);
    });

    it("calculates ₹78,000 for 3 kW residential system", () => {
      expect(calculatePMSuryaGharSubsidy(3, "RESIDENTIAL")).toBe(78000);
    });

    it("caps subsidy at ₹78,000 for residential systems above 3 kW", () => {
      expect(calculatePMSuryaGharSubsidy(5, "RESIDENTIAL")).toBe(78000);
      expect(calculatePMSuryaGharSubsidy(10, "RESIDENTIAL")).toBe(78000);
    });

    it("calculates ₹18,000/kW for Group Housing Society common meters", () => {
      expect(calculatePMSuryaGharSubsidy(10, "HOUSING_SOCIETY")).toBe(180000);
    });

    it("returns ₹0 subsidy for commercial and industrial consumers", () => {
      expect(calculatePMSuryaGharSubsidy(5, "COMMERCIAL")).toBe(0);
      expect(calculatePMSuryaGharSubsidy(50, "INDUSTRIAL")).toBe(0);
    });
  });

  describe("Benchmark System Costs", () => {
    it("applies correct cost tier per kW", () => {
      const brackets = SYNTHETIC_ASSUMPTION.benchmarkCostPerKw;
      expect(getBenchmarkCostPerKW(1.5, brackets)).toBe(55000);
      expect(getBenchmarkCostPerKW(3.0, brackets)).toBe(52000);
      expect(getBenchmarkCostPerKW(6.0, brackets)).toBe(48000);
      expect(getBenchmarkCostPerKW(15.0, brackets)).toBe(45000);
    });
  });

  describe("System Sizing, Generation, Financial Savings & Payback", () => {
    it("calculates capacity, generation, savings and payback correctly for 3 kW residential setup", () => {
      // Monthly Bill: ₹3,500 at ₹7/kWh => 500 kWh/month => 6,000 kWh/year
      // To offset 6000 kWh/year at 1500 kWh/kW yield => 4.0 kW recommended by consumption
      // Rooftop Area: 300 sq ft => max 3.0 kW by area
      // Optimal capacity = min(4.0, 3.0) = 3.0 kW
      const input: SolarInput = {
        state: "TEST_STATE",
        monthlyBillInr: 3500,
        electricityTariffInr: 7.0,
        rooftopAreaSqFt: 300,
        consumerCategory: "RESIDENTIAL",
      };

      const result = calculateSolarROI(input, SYNTHETIC_ASSUMPTION);
      expect(result.isValid).toBe(true);
      expect(result.effectiveCapacityKW).toBe(3.0);
      expect(result.maxCapacityFromAreaKW).toBe(3.0);
      // Generation = 3 kW * 1500 kWh/kW = 4,500 kWh
      expect(result.estimatedAnnualGenerationKWh).toBe(4500);
      // Savings = 4,500 kWh * ₹7.00 = ₹31,500/year
      expect(result.estimatedAnnualSavingsInr).toBe(31500);
      // Gross Cost = 3 kW * ₹52,000 = ₹156,000
      expect(result.estimatedGrossCostInr).toBe(156000);
      // Subsidy = ₹78,000
      expect(result.applicableSubsidyInr).toBe(78000);
      // Net Investment = 156000 - 78000 = ₹78,000
      expect(result.netInvestmentInr).toBe(78000);
      // Payback = 78000 / 31500 = ~2.5 years
      expect(result.paybackPeriodYears).toBe(2.5);
      // CO2 avoided = (4500 * 0.716) / 1000 = 3.22 tonnes
      expect(result.annualCO2AvoidedTonnes).toBe(3.22);
    });

    it("respects user proposed capacity override", () => {
      const input: SolarInput = {
        state: "TEST_STATE",
        monthlyBillInr: 5000,
        electricityTariffInr: 7.0,
        rooftopAreaSqFt: 500,
        consumerCategory: "RESIDENTIAL",
        proposedCapacityKW: 2.0, // User explicitly requests 2 kW
      };

      const result = calculateSolarROI(input, SYNTHETIC_ASSUMPTION);
      expect(result.isValid).toBe(true);
      expect(result.effectiveCapacityKW).toBe(2.0);
      expect(result.estimatedAnnualGenerationKWh).toBe(3000); // 2 * 1500
      expect(result.applicableSubsidyInr).toBe(60000); // 2 kW subsidy = ₹60,000
    });
  });

  describe("Missing State Assumptions Edge Case", () => {
    it("halts with descriptive error when state assumption is unavailable", () => {
      const input: SolarInput = {
        state: "UNLISTED_STATE",
        monthlyBillInr: 3000,
        electricityTariffInr: 7.0,
        rooftopAreaSqFt: 300,
        consumerCategory: "RESIDENTIAL",
      };

      const result = calculateSolarROI(input, null);
      expect(result.isValid).toBe(false);
      expect(result.validationErrors[0]).toContain(
        "Verified solar insolation and cost benchmarks for State: 'UNLISTED_STATE' are currently missing"
      );
      expect(result.effectiveCapacityKW).toBe(0);
      expect(result.estimatedAnnualSavingsInr).toBe(0);
    });
  });
});
