import { NextResponse } from "next/server";
import { SolarStateAssumption } from "@/lib/types/solar";

/**
 * Official Indian Solar Insolation, Benchmark Turnkey Costs, Tariffs and Subsidy Rules.
 * Sourced directly from:
 * 1. Ministry of New and Renewable Energy (MNRE) - PM Surya Ghar: Muft Bijli Yojana (Feb 2024 Gazette)
 * 2. National Institute of Solar Energy (NISE) Solar Resource Assessment
 * 3. Central Electricity Authority (CEA) Baseline Database for Indian Power Sector (Ver. 19/2023)
 * 4. State Electricity Regulatory Commissions (SERCs) Average Cost of Supply & Retail Tariffs
 */
const VERIFIED_SOLAR_ASSUMPTIONS: Record<string, SolarStateAssumption> = {
  KARNATAKA: {
    stateCode: "KARNATAKA",
    stateName: "Karnataka",
    annualGenerationPerKW: 1500, // 4.11 kWh/kW/day
    dailySunHours: 4.5,
    benchmarkTariffInr: 7.2, // BESCOM / KERC composite residential/commercial tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 55000,
      upTo3kW: 52000,
      upTo10kW: 48000,
      above10kW: 45000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE)",
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
    dataSource: "KERC Tariff Schedule / MNRE NISE Solar Atlas / CEA Ver 19",
    lastUpdated: "2024-06-01",
  },
  MAHARASHTRA: {
    stateCode: "MAHARASHTRA",
    stateName: "Maharashtra",
    annualGenerationPerKW: 1460, // 4.0 kWh/kW/day
    dailySunHours: 4.4,
    benchmarkTariffInr: 8.1, // MSEDCL / MERC average residential slab tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 56000,
      upTo3kW: 53000,
      upTo10kW: 49000,
      above10kW: 46000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE)",
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
    dataSource: "MERC Multi-Year Tariff Order / MNRE Empanelled Vendors",
    lastUpdated: "2024-06-01",
  },
  GUJARAT: {
    stateCode: "GUJARAT",
    stateName: "Gujarat",
    annualGenerationPerKW: 1550, // 4.25 kWh/kW/day (High solar irradiance)
    dailySunHours: 4.8,
    benchmarkTariffInr: 6.5, // GUVNL / GERC retail tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 52000,
      upTo3kW: 50000,
      upTo10kW: 46000,
      above10kW: 43000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE) + Surya Gujarat",
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
    dataSource: "GERC Solar Regulations / GEDA / MNRE National Portal",
    lastUpdated: "2024-05-15",
  },
  RAJASTHAN: {
    stateCode: "RAJASTHAN",
    stateName: "Rajasthan",
    annualGenerationPerKW: 1600, // 4.38 kWh/kW/day (Highest solar insolation in India)
    dailySunHours: 5.0,
    benchmarkTariffInr: 6.8, // JVVNL / RERC tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 53000,
      upTo3kW: 51000,
      upTo10kW: 47000,
      above10kW: 44000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE)",
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
    dataSource: "RREC / RERC Tariff Order / MNRE Benchmark",
    lastUpdated: "2024-05-20",
  },
  TAMIL_NADU: {
    stateCode: "TAMIL_NADU",
    stateName: "Tamil Nadu",
    annualGenerationPerKW: 1520, // 4.16 kWh/kW/day
    dailySunHours: 4.6,
    benchmarkTariffInr: 6.9, // TANGEDCO / TNERC composite tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 54000,
      upTo3kW: 51000,
      upTo10kW: 47500,
      above10kW: 44500,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE)",
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
    dataSource: "TNERC Comprehensive Tariff Order / TEDA",
    lastUpdated: "2024-06-01",
  },
  DELHI: {
    stateCode: "DELHI",
    stateName: "Delhi (NCT)",
    annualGenerationPerKW: 1400, // 3.84 kWh/kW/day
    dailySunHours: 4.2,
    benchmarkTariffInr: 7.5, // DERC composite tariff (excluding lifeline subsidies)
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 57000,
      upTo3kW: 54000,
      upTo10kW: 50000,
      above10kW: 47000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE) + Delhi Solar Policy 2024 (GBI ₹3/unit)",
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
    dataSource: "DERC / Delhi Solar Policy Gazette / MNRE",
    lastUpdated: "2024-04-10",
  },
  UTTAR_PRADESH: {
    stateCode: "UTTAR_PRADESH",
    stateName: "Uttar Pradesh",
    annualGenerationPerKW: 1420, // 3.89 kWh/kW/day
    dailySunHours: 4.3,
    benchmarkTariffInr: 6.75, // UPPCL / UPERC tariff
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 55000,
      upTo3kW: 52000,
      upTo10kW: 48000,
      above10kW: 45000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE) + State Top-up (₹15,000/kW up to ₹30,000)",
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
    dataSource: "UPNEDA / UPERC Tariff Schedule / MNRE",
    lastUpdated: "2024-05-18",
  },
  TELANGANA: {
    stateCode: "TELANGANA",
    stateName: "Telangana",
    annualGenerationPerKW: 1510,
    dailySunHours: 4.5,
    benchmarkTariffInr: 7.0,
    areaRequiredPerKW_SqFt: 100,
    benchmarkCostPerKw: {
      upTo2kW: 54000,
      upTo3kW: 51000,
      upTo10kW: 47000,
      above10kW: 44000,
    },
    subsidySchemeName: "PM Surya Ghar: Muft Bijli Yojana (MNRE)",
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
    dataSource: "TSREDCO / TSERC Retail Tariff Order",
    lastUpdated: "2024-05-01",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");

  if (state) {
    const key = state.toUpperCase().replace(/\s+/g, "_");
    const found = VERIFIED_SOLAR_ASSUMPTIONS[key];
    if (found) {
      const retrievedAt = new Date().toISOString();
      return NextResponse.json({
        status: "success",
        success: true,
        asOf: found.lastUpdated,
        retrievedAt,
        retrievalTimestamp: retrievedAt,
        source: found.dataSource,
        sourceAuthority: "Ministry of New and Renewable Energy (MNRE) & CEA",
        sourceUrl: "https://pmsuryaghar.gov.in/",
        assumption: found,
        data: found,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `No verified solar assumptions found for state: '${state}'.`,
          availableStates: Object.keys(VERIFIED_SOLAR_ASSUMPTIONS),
        },
        { status: 404 }
      );
    }
  }

  // Return all verified state assumptions
  const assumptionsList = Object.values(VERIFIED_SOLAR_ASSUMPTIONS);
  const retrievedAt = new Date().toISOString();
  return NextResponse.json({
    status: "success",
    success: true,
    asOf: "2024-06-01",
    retrievedAt,
    retrievalTimestamp: retrievedAt,
    source: "Ministry of New and Renewable Energy (MNRE) & Central Electricity Authority (CEA)",
    sourceAuthority: "Ministry of New and Renewable Energy (MNRE) & Central Electricity Authority (CEA)",
    sourceUrl: "https://pmsuryaghar.gov.in/",
    count: assumptionsList.length,
    assumptions: assumptionsList,
    data: {
      assumptions: assumptionsList,
      count: assumptionsList.length,
    },
  });
}
