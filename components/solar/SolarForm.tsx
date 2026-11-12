"use client";

import React, { useState, useEffect } from "react";
import {
  SolarInput,
  SolarStateAssumption,
  ConsumerCategory,
} from "@/lib/types/solar";
import { Sun, RotateCcw, HelpCircle, MapPin, Building, Home, Factory } from "lucide-react";

interface SolarFormProps {
  assumptions: SolarStateAssumption[];
  onCalculate: (input: SolarInput) => void;
  isLoading?: boolean;
}

export default function SolarForm({
  assumptions,
  onCalculate,
  isLoading,
}: SolarFormProps) {
  const [selectedState, setSelectedState] = useState<string>("KARNATAKA");
  const [monthlyBill, setMonthlyBill] = useState<string>("4500");
  const [tariff, setTariff] = useState<string>("7.20");
  const [rooftopArea, setRooftopArea] = useState<string>("400");
  const [consumerCategory, setConsumerCategory] =
    useState<ConsumerCategory>("RESIDENTIAL");
  const [proposedCapacity, setProposedCapacity] = useState<string>("");

  // When state changes, update default verified tariff
  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    const found = assumptions.find(
      (a) => a.stateCode.toUpperCase() === stateCode.toUpperCase()
    );
    if (found && found.benchmarkTariffInr) {
      setTariff(found.benchmarkTariffInr.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      state: selectedState,
      monthlyBillInr: parseFloat(monthlyBill) || 0,
      electricityTariffInr: parseFloat(tariff) || 0,
      rooftopAreaSqFt: parseFloat(rooftopArea) || 0,
      consumerCategory,
      proposedCapacityKW: proposedCapacity ? parseFloat(proposedCapacity) : undefined,
    });
  };

  const handleReset = () => {
    setSelectedState("KARNATAKA");
    setMonthlyBill("4500");
    setTariff("7.20");
    setRooftopArea("400");
    setConsumerCategory("RESIDENTIAL");
    setProposedCapacity("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            Solar Sizing & Financial Parameters
          </h3>
          <p className="text-xs text-slate-400">
            Calibrated with state-specific insolation & PM Surya Ghar norms
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

      <div className="space-y-4">
        {/* State Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Installation State
            </span>
            <span className="text-[11px] text-slate-400">
              Loads verified yield & tariff
            </span>
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
          >
            {assumptions.map((a) => (
              <option key={a.stateCode} value={a.stateCode}>
                {a.stateName} (Benchmark: {a.annualGenerationPerKW} kWh/kW/yr, ~₹
                {a.benchmarkTariffInr}/unit)
              </option>
            ))}
          </select>
        </div>

        {/* Consumer Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Consumer Category (Determines PM Surya Ghar CFA Subsidy)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConsumerCategory("RESIDENTIAL")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                consumerCategory === "RESIDENTIAL"
                  ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Residential (Up to ₹78k Subsidy)</span>
            </button>
            <button
              type="button"
              onClick={() => setConsumerCategory("HOUSING_SOCIETY")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                consumerCategory === "HOUSING_SOCIETY"
                  ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Group Housing (RWA)</span>
            </button>
            <button
              type="button"
              onClick={() => setConsumerCategory("COMMERCIAL")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                consumerCategory === "COMMERCIAL"
                  ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Commercial (No Subsidy)</span>
            </button>
            <button
              type="button"
              onClick={() => setConsumerCategory("INDUSTRIAL")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                consumerCategory === "INDUSTRIAL"
                  ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <Factory className="w-4 h-4 text-slate-400" />
              <span>Industrial (No Subsidy)</span>
            </button>
          </div>
        </div>

        {/* Monthly Bill & Electricity Tariff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Average Monthly Bill (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="4500"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Avg. monthly power expense
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Electricity Tariff (₹ / kWh)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="0.05"
                required
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                placeholder="7.20"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Discom retail energy charge
            </p>
          </div>
        </div>

        {/* Available Rooftop Area & Optional Proposed Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Shadow-Free Rooftop Area</span>
              <span className="text-[11px] text-slate-400">Sq. Ft.</span>
            </label>
            <input
              type="number"
              min="50"
              step="10"
              required
              value={rooftopArea}
              onChange={(e) => setRooftopArea(e.target.value)}
              placeholder="400"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              ~100 sq ft needed per kWp
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Proposed Capacity (kW)</span>
              <span className="text-[10px] text-amber-400 uppercase font-semibold">
                Optional Override
              </span>
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={proposedCapacity}
              onChange={(e) => setProposedCapacity(e.target.value)}
              placeholder="Leave empty for auto-sizing"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to calculate optimal size
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Sun className="w-4 h-4 text-slate-950" />
          {isLoading ? "Fetching State Benchmarks..." : "Calculate Solar ROI & Sizing"}
        </button>
      </div>
    </form>
  );
}
