"use client";

import React, { useState, useEffect } from "react";
import SolarForm from "@/components/solar/SolarForm";
import SolarResultCard from "@/components/solar/SolarResultCard";
import {
  SolarInput,
  SolarStateAssumption,
  SolarCalculationResult,
} from "@/lib/types/solar";
import { calculateSolarROI } from "@/lib/calculations/solar";
import { Sun, Database, RefreshCw, AlertCircle } from "lucide-react";

export default function SolarPage() {
  const [assumptions, setAssumptions] = useState<SolarStateAssumption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<SolarCalculationResult | null>(null);

  const fetchAssumptions = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/solar-assumptions");
      if (!res.ok) {
        throw new Error(
          `Failed to load solar assumptions: ${res.status} ${res.statusText}`
        );
      }
      const data = await res.json();
      if (data.assumptions && Array.isArray(data.assumptions)) {
        setAssumptions(data.assumptions);

        // Run default initial calculation with Karnataka benchmark
        const defaultState = data.assumptions.find(
          (a: SolarStateAssumption) => a.stateCode === "KARNATAKA"
        ) || data.assumptions[0];

        const defaultInput: SolarInput = {
          state: defaultState.stateCode,
          monthlyBillInr: 4500,
          electricityTariffInr: defaultState.benchmarkTariffInr || 7.2,
          rooftopAreaSqFt: 400,
          consumerCategory: "RESIDENTIAL",
        };

        const result = calculateSolarROI(defaultInput, defaultState);
        setCalculationResult(result);
      } else {
        throw new Error("Invalid response format from /api/solar-assumptions");
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to connect to solar backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssumptions();
  }, []);

  const handleCalculate = (input: SolarInput) => {
    const matchedAssumption =
      assumptions.find(
        (a) => a.stateCode.toUpperCase() === input.state.toUpperCase()
      ) || null;

    const result = calculateSolarROI(input, matchedAssumption);
    setCalculationResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sun className="w-4 h-4" />
              <span>Decentralized Generation Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Rooftop Solar ROI & Sizing Calculator
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Model system sizing, capital recovery, and 25-year financial savings
              leveraging official solar insolation, State DISCOM retail tariffs, and
              the Ministry of New and Renewable Energy PM Surya Ghar: Muft Bijli
              Yojana central subsidy schedule.
            </p>
          </div>

          {/* Backend Connection Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-3 text-xs">
              <Database className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Connected API
                </span>
                <span className="font-mono text-amber-300 font-medium">
                  GET /api/solar-assumptions
                </span>
              </div>
              <button
                onClick={fetchAssumptions}
                disabled={isLoading}
                title="Reload Assumptions"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* API Error Notification */}
        {apiError && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <strong className="font-bold">Backend API Notice: </strong>
              {apiError}
            </div>
            <button
              onClick={fetchAssumptions}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (5 cols) */}
          <div className="lg:col-span-5">
            <SolarForm
              assumptions={assumptions}
              onCalculate={handleCalculate}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Result Card (7 cols) */}
          <div className="lg:col-span-7">
            <SolarResultCard result={calculationResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
