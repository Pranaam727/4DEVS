"use client";

import React from "react";
import { SolarCalculationResult } from "@/lib/types/solar";
import {
  Sun,
  IndianRupee,
  TrendingUp,
  Leaf,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  TreeDeciduous,
  Zap,
} from "lucide-react";

interface SolarResultCardProps {
  result: SolarCalculationResult | null;
}

export default function SolarResultCard({ result }: SolarResultCardProps) {
  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Sun className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-300">
          Awaiting Solar Site Parameters
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Select your state and enter monthly bill details to view recommended
          system capacity, MNRE PM Surya Ghar subsidy eligibility, and payback
          economics.
        </p>
      </div>
    );
  }

  // Handle Validation Errors / Missing State Benchmarks
  if (!result.isValid) {
    return (
      <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-6 text-red-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <h4 className="text-base font-bold text-white">
            Missing or Invalid Solar Information
          </h4>
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs text-red-300">
          {result.validationErrors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
        <p className="text-[11px] text-red-400 mt-4 italic border-t border-red-900/40 pt-2">
          Note: To prevent fabricated or misleading estimates, calculations are
          halted until verified state parameters are supplied.
        </p>
      </div>
    );
  }

  const { stateAssumptionUsed } = result;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Banner: Sizing Recommendation Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              OPTIMAL SYSTEM SIZING
            </span>
            <span className="text-xs text-slate-400">
              State: <strong className="text-white">{stateAssumptionUsed?.stateName}</strong>
            </span>
          </div>
          <div className="text-3xl font-black text-amber-300 mt-1 flex items-baseline gap-2">
            {result.effectiveCapacityKW} kWp
            <span className="text-xs font-normal text-slate-400">
              Recommended Rooftop Solar Plant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Covers ~
            {Math.min(
              100,
              Math.round(
                (result.estimatedAnnualGenerationKWh /
                  (result.estimatedAnnualConsumptionKWh || 1)) *
                  100
              )
            )}
            % of estimated electricity usage ({result.estimatedMonthlyConsumptionKWh} kWh/month)
          </p>
        </div>

        {/* Payback Badge */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 text-center sm:text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Estimated Payback
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {result.paybackPeriodYears > 0 ? `${result.paybackPeriodYears} Yrs` : "N/A"}
          </span>
          <span className="text-[10px] text-slate-500 block">
            Simple capital recovery
          </span>
        </div>
      </div>

      {/* Sizing & Energy Generation Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Annual Generation
          </span>
          <div className="text-xl font-black text-slate-100 mt-1 font-mono">
            {result.estimatedAnnualGenerationKWh.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            kWh / Year (~{result.estimatedDailyGenerationKWh} units/day)
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Estimated Annual Savings
          </span>
          <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
            ₹{result.estimatedAnnualSavingsInr.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            ~₹{result.estimatedMonthlySavingsInr.toLocaleString()} / month
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Roof Space Utilized
          </span>
          <div className="text-xl font-black text-slate-100 mt-1 font-mono">
            {Math.round(result.effectiveCapacityKW * (stateAssumptionUsed?.areaRequiredPerKW_SqFt || 100))}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Sq. Ft. shadow-free roof
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            25-Yr Lifetime Net Savings
          </span>
          <div className="text-xl font-black text-amber-300 mt-1 font-mono">
            ₹{result.lifetime25YrSavingsInr.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Net of degradation & initial cost
          </span>
        </div>
      </div>

      {/* Capital Expenditure & PM Surya Ghar Subsidy Breakdown */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Investment & Verified Subsidy Breakdown</span>
          <span className="text-[10px] text-amber-400 font-mono font-normal">
            MNRE Benchmark Empanelled Pricing
          </span>
        </h5>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">
              Gross Benchmark Turnkey Cost ({result.effectiveCapacityKW} kWp @ ₹
              {result.benchmarkCostPerKWInr.toLocaleString()}/kWp):
            </span>
            <span className="text-slate-200 font-mono font-semibold">
              ₹{result.estimatedGrossCostInr.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Central Subsidy (PM Surya Ghar: Muft Bijli Yojana):
            </span>
            <span className="font-mono font-bold">
              {result.applicableSubsidyInr > 0
                ? `- ₹${result.applicableSubsidyInr.toLocaleString()}`
                : "₹0 (Not eligible for C&I)"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 text-sm font-bold text-white bg-slate-900/80 px-3 rounded-lg border border-slate-700/60">
            <span>Estimated Net Customer Outlay:</span>
            <span className="font-mono text-base text-amber-300">
              ₹{result.netInvestmentInr.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          * Subsidy is disbursed via Direct Benefit Transfer (DBT) directly into
          the consumer bank account following installation by an empanelled vendor
          and net-meter commissioning by the local Discom.
        </p>
      </div>

      {/* Environmental Decarbonization Impact */}
      <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Leaf className="w-4 h-4 text-emerald-400" />
            Environmental Decarbonization Impact (CEA Grid Factor)
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-800">
            0.716 kg CO2 / kWh
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Annual CO2 Avoided
            </span>
            <p className="text-lg font-bold text-emerald-300 mt-0.5 font-mono">
              {result.annualCO2AvoidedTonnes} Tonnes
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              25-Year CO2 Avoided
            </span>
            <p className="text-lg font-bold text-teal-300 mt-0.5 font-mono">
              {result.lifetimeCO2AvoidedTonnes} Tonnes
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <TreeDeciduous className="w-3 h-3 text-emerald-400" />
              Trees Equivalent
            </span>
            <p className="text-lg font-bold text-amber-300 mt-0.5 font-mono">
              ~{result.equivalentTreesPlanted} Trees
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Formulas and Official Assumptions */}
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-2">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Formulas & Technical Assumptions Used
        </h5>
        <div className="space-y-1 font-mono text-[11px] text-slate-400">
          <p>• {result.formulasAndAssumptions.formulaConsumption}</p>
          <p>• {result.formulasAndAssumptions.formulaRecommendedCapacity}</p>
          <p>• {result.formulasAndAssumptions.formulaGeneration}</p>
          <p>• {result.formulasAndAssumptions.formulaCost}</p>
          <p>• {result.formulasAndAssumptions.formulaSubsidy}</p>
          <p>• {result.formulasAndAssumptions.formulaPayback}</p>
        </div>
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p>
            <strong>Regulatory Sources:</strong> {result.formulasAndAssumptions.subsidyReference} | {result.formulasAndAssumptions.ceaEmissionFactorSource}
          </p>
          <p className="italic text-amber-500/80">
            <strong>Non-Guarantee Notice:</strong> {result.formulasAndAssumptions.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
