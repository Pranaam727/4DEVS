"use client";

import React, { useState } from "react";
import { RPOInput, ConsumptionUnit, EntityType, JurisdictionCode } from "@/lib/types/rpo";
import { Calculator, RotateCcw, HelpCircle } from "lucide-react";

interface RpoFormProps {
  onCalculate: (input: RPOInput) => void;
  isLoading?: boolean;
}

export default function RpoForm({ onCalculate, isLoading }: RpoFormProps) {
  const [totalConsumption, setTotalConsumption] = useState<string>("10000");
  const [renewableProcurement, setRenewableProcurement] = useState<string>("2400");
  const [unit, setUnit] = useState<ConsumptionUnit>("MWh");
  const [entityType, setEntityType] = useState<EntityType>("DISCOM");
  const [jurisdiction, setJurisdiction] = useState<JurisdictionCode>("NATIONAL");
  const [compliancePeriod, setCompliancePeriod] = useState<string>("2024-25");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      totalConsumption: parseFloat(totalConsumption) || 0,
      renewableProcurement: parseFloat(renewableProcurement) || 0,
      unit,
      entityType,
      jurisdiction,
      compliancePeriod,
    });
  };

  const handleReset = () => {
    setTotalConsumption("");
    setRenewableProcurement("");
    setUnit("MWh");
    setEntityType("DISCOM");
    setJurisdiction("NATIONAL");
    setCompliancePeriod("2024-25");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Compliance Parameters
          </h3>
          <p className="text-xs text-slate-400">
            Enter your energy procurement and institutional classification
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Electricity Consumption */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Total Electricity Consumption</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Gross billed units
            </span>
          </label>
          <div className="relative flex rounded-lg shadow-sm">
            <input
              type="number"
              step="any"
              min="0"
              required
              value={totalConsumption}
              onChange={(e) => setTotalConsumption(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full bg-slate-950 border border-slate-700 rounded-l-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as ConsumptionUnit)}
              className="bg-slate-800 border border-l-0 border-slate-700 rounded-r-lg px-3 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500"
              title="Select Measurement Unit"
            >
              <option value="MWh">MWh</option>
              <option value="MU">MU (Million Units)</option>
              <option value="kWh">kWh</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            1 MU (Million Unit) = 1,000 MWh = 1,000,000 kWh
          </p>
        </div>

        {/* Renewable Electricity Procurement */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Renewable Electricity Procurement</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Direct PPA / Rooftop / Open Access
            </span>
          </label>
          <div className="relative flex rounded-lg shadow-sm">
            <input
              type="number"
              step="any"
              min="0"
              required
              value={renewableProcurement}
              onChange={(e) => setRenewableProcurement(e.target.value)}
              placeholder="e.g. 2400"
              className="w-full bg-slate-950 border border-slate-700 rounded-l-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <span className="inline-flex items-center px-3.5 bg-slate-800 border border-l-0 border-slate-700 rounded-r-lg text-xs font-semibold text-emerald-300">
              {unit}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Exclude fossil sources, diesel generators & unbundled RECs
          </p>
        </div>

        {/* Applicable Entity Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Applicable Obligated Entity Type
          </label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="DISCOM">
              Distribution Licensee (DISCOM / Power Utility)
            </option>
            <option value="OPEN_ACCESS">
              Open Access Consumer (Commercial / Industrial &gt; 1 MW)
            </option>
            <option value="CAPTIVE_USER">
              Captive Generating Plant (CGP / Industrial Captive User)
            </option>
          </select>
          <p className="text-[11px] text-slate-500">
            Entities defined under Section 86(1)(e) of the Electricity Act 2003
          </p>
        </div>

        {/* Regulatory Jurisdiction */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Regulatory Jurisdiction (SERC / MoP)
          </label>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as JurisdictionCode)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="NATIONAL">
              National Trajectory (Ministry of Power / MoP Order)
            </option>
            <option value="KARNATAKA">Karnataka (KERC RPO Regulations)</option>
            <option value="MAHARASHTRA">Maharashtra (MERC RPO Regulations)</option>
            <option value="GUJARAT">Gujarat (GERC Notification)</option>
            <option value="TAMIL_NADU">Tamil Nadu (TNERC RPO Regulations)</option>
            <option value="DELHI">Delhi (DERC Business Plan Order)</option>
            <option value="RAJASTHAN">Rajasthan (RERC Regulations)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Select your specific state commission or the central MoP guideline
          </p>
        </div>

        {/* Compliance Period */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">
            Statutory Compliance Period (Financial Year)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["2023-24", "2024-25", "2025-26", "2026-27"].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setCompliancePeriod(period)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                  compliancePeriod === period
                    ? "bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                FY {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          {isLoading ? "Fetching Regulatory Targets..." : "Calculate RPO Compliance"}
        </button>
      </div>
    </form>
  );
}
