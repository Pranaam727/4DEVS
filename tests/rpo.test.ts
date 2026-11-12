import { describe, it, expect } from "vitest";
import {
  calculateRPOCompliance,
  findMatchingTarget,
  validateRpoInput,
  convertToMWh,
} from "../lib/calculations/rpo";
import { RPOInput, RPOTarget } from "../lib/types/rpo";

// Synthetic test fixture strictly for isolated automated tests
const SYNTHETIC_TARGETS: RPOTarget[] = [
  {
    id: "synthetic-target-mop-24-25",
    jurisdiction: "NATIONAL",
    jurisdictionName: "National Synthetic",
    entityType: "DISCOM",
    entityTypeName: "DISCOM Synthetic",
    compliancePeriod: "2024-25",
    windRpoPercent: 6.94,
    hydroRpoPercent: 0.38,
    otherRpoPercent: 22.59,
    totalRpoPercent: 29.91,
    regulatorySource: "Synthetic Test MoP Order",
    effectiveDate: "2024-04-01",
    orderNumber: "TEST-MOP-2024",
    applicabilityNotes: "Automated test fixture",
    isVerified: true,
  },
  {
    id: "synthetic-target-karnataka-24-25",
    jurisdiction: "KARNATAKA",
    jurisdictionName: "Karnataka Synthetic",
    entityType: "OPEN_ACCESS",
    entityTypeName: "Open Access Synthetic",
    compliancePeriod: "2024-25",
    windRpoPercent: 6.5,
    hydroRpoPercent: 0.38,
    otherRpoPercent: 16.12,
    totalRpoPercent: 23.0,
    regulatorySource: "Synthetic Test KERC Order",
    effectiveDate: "2024-04-01",
    orderNumber: "TEST-KERC-2024",
    applicabilityNotes: "Automated test fixture for OA",
    isVerified: true,
  },
];

describe("RPO Compliance Calculations Engine", () => {
  describe("Unit Conversions", () => {
    it("converts kWh to MWh accurately", () => {
      expect(convertToMWh(1000000, "kWh")).toBe(1000);
      expect(convertToMWh(500, "kWh")).toBe(0.5);
    });

    it("converts MU (Million Units) to MWh accurately", () => {
      expect(convertToMWh(10, "MU")).toBe(10000); // 10 MU = 10,000 MWh
    });

    it("handles MWh without conversion", () => {
      expect(convertToMWh(2500, "MWh")).toBe(2500);
    });

    it("returns 0 for negative or invalid unit inputs", () => {
      expect(convertToMWh(-100, "MWh")).toBe(0);
      expect(convertToMWh(NaN, "kWh")).toBe(0);
    });
  });

  describe("Validation Rules", () => {
    it("flags negative electricity consumption as invalid", () => {
      const input: RPOInput = {
        totalConsumption: -500,
        renewableProcurement: 100,
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };
      const validation = validateRpoInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Total electricity consumption cannot be negative."
      );
    });

    it("flags negative renewable procurement as invalid", () => {
      const input: RPOInput = {
        totalConsumption: 1000,
        renewableProcurement: -50,
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };
      const validation = validateRpoInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Renewable electricity procurement cannot be negative."
      );
    });

    it("requires jurisdiction, entityType, and compliance period", () => {
      const input: RPOInput = {
        totalConsumption: 1000,
        renewableProcurement: 200,
        unit: "MWh",
        entityType: "",
        jurisdiction: "",
        compliancePeriod: "",
      };
      const validation = validateRpoInput(input);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBe(3);
    });
  });

  describe("Target Selection", () => {
    it("selects exact match for jurisdiction, entity type, and period", () => {
      const matched = findMatchingTarget(
        SYNTHETIC_TARGETS,
        "KARNATAKA",
        "OPEN_ACCESS",
        "2024-25"
      );
      expect(matched).not.toBeNull();
      expect(matched?.id).toBe("synthetic-target-karnataka-24-25");
      expect(matched?.totalRpoPercent).toBe(23.0);
    });

    it("falls back to national trajectory if state entity is unspecified but national exists", () => {
      const matched = findMatchingTarget(
        SYNTHETIC_TARGETS,
        "NATIONAL",
        "DISCOM",
        "2024-25"
      );
      expect(matched).not.toBeNull();
      expect(matched?.totalRpoPercent).toBe(29.91);
    });

    it("returns null when no matching target exists", () => {
      const matched = findMatchingTarget(
        SYNTHETIC_TARGETS,
        "NON_EXISTENT_STATE",
        "DISCOM",
        "2010-11"
      );
      expect(matched).toBeNull();
    });
  });

  describe("Percentage Calculations & Shortfall Determination", () => {
    const target = SYNTHETIC_TARGETS[0]; // 29.91% target

    it("calculates shortfall when renewable procurement is below target", () => {
      const input: RPOInput = {
        totalConsumption: 10000, // 10,000 MWh
        renewableProcurement: 2000, // 2,000 MWh (20%)
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };

      const result = calculateRPOCompliance(input, target);
      expect(result.isValid).toBe(true);
      expect(result.actualRpoPercent).toBe(20.0);
      expect(result.applicableTargetPercent).toBe(29.91);
      // Required = 10000 * 29.91% = 2991 MWh
      expect(result.requiredProcurementMWh).toBe(2991);
      // Shortfall = 2991 - 2000 = 991 MWh
      expect(result.shortfallMWh).toBe(991);
      expect(result.surplusMWh).toBe(0);
      expect(result.complianceStatus).toBe("SHORTFALL");
      expect(result.recEquivalentRequired).toBe(991);
      expect(result.estimatedRecCostRangeInr?.min).toBe(991000);
    });

    it("calculates surplus when renewable procurement exceeds target", () => {
      const input: RPOInput = {
        totalConsumption: 10000,
        renewableProcurement: 3500, // 35% > 29.91%
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };

      const result = calculateRPOCompliance(input, target);
      expect(result.isValid).toBe(true);
      expect(result.actualRpoPercent).toBe(35.0);
      expect(result.shortfallMWh).toBe(0);
      expect(result.surplusMWh).toBe(509); // 3500 - 2991
      expect(result.complianceStatus).toBe("SURPLUS");
      expect(result.recEquivalentRequired).toBe(0);
      expect(result.estimatedRecCostRangeInr).toBeNull();
    });

    it("evaluates COMPLIANT when renewable procurement exactly meets target", () => {
      const input: RPOInput = {
        totalConsumption: 10000,
        renewableProcurement: 2991, // Exactly 29.91%
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };

      const result = calculateRPOCompliance(input, target);
      expect(result.isValid).toBe(true);
      expect(result.shortfallMWh).toBe(0);
      expect(result.complianceStatus).toBe("COMPLIANT");
    });
  });

  describe("Zero Consumption Edge Case", () => {
    it("handles zero consumption gracefully without division by zero errors", () => {
      const target = SYNTHETIC_TARGETS[0];
      const input: RPOInput = {
        totalConsumption: 0,
        renewableProcurement: 0,
        unit: "MWh",
        entityType: "DISCOM",
        jurisdiction: "NATIONAL",
        compliancePeriod: "2024-25",
      };

      const result = calculateRPOCompliance(input, target);
      expect(result.isValid).toBe(true);
      expect(result.actualRpoPercent).toBe(0);
      expect(result.requiredProcurementMWh).toBe(0);
      expect(result.shortfallMWh).toBe(0);
      expect(result.complianceStatus).toBe("ZERO_CONSUMPTION");
    });
  });

  describe("Target Unavailable Edge Case", () => {
    it("indicates TARGET_UNAVAILABLE while computing actual procurement achievement", () => {
      const input: RPOInput = {
        totalConsumption: 1000,
        renewableProcurement: 250,
        unit: "MWh",
        entityType: "UNKNOWN",
        jurisdiction: "UNKNOWN",
        compliancePeriod: "2099-00",
      };

      const result = calculateRPOCompliance(input, null);
      expect(result.isValid).toBe(true);
      expect(result.applicableTargetPercent).toBeNull();
      expect(result.actualRpoPercent).toBe(25.0);
      expect(result.complianceStatus).toBe("TARGET_UNAVAILABLE");
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });
  });
});
