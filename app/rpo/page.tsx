"use client";

import React, { useState, useEffect } from "react";
import RpoForm from "@/components/rpo/RpoForm";
import RpoResultCard from "@/components/rpo/RpoResultCard";
import {
  RPOInput,
  RPOTarget,
  RPOCalculationResult,
} from "@/lib/types/rpo";
import {
  calculateRPOCompliance,
  findMatchingTarget,
} from "@/lib/calculations/rpo";
import { ShieldCheck, Database, RefreshCw, AlertCircle } from "lucide-react";

export default function RpoPage() {
  const [targets, setTargets] = useState<RPOTarget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<RPOCalculationResult | null>(null);

  // Fetch verified targets from GET /api/rpo-targets
  const fetchTargets = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/rpo-targets");
      if (!res.ok) {
        throw new Error(`Failed to load RPO targets: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (data.targets && Array.isArray(data.targets)) {
        setTargets(data.targets);
        // Compute default initial calculation
        const defaultInput: RPOInput = {
          totalConsumption: 10000,
          renewableProcurement: 2400,
          unit: "MWh",
          entityType: "DISCOM",
          jurisdiction: "NATIONAL",
          compliancePeriod: "2024-25",
        };
        const defaultTarget = findMatchingTarget(
          data.targets,
          defaultInput.jurisdiction,
          defaultInput.entityType,
          defaultInput.compliancePeriod
        );
        const result = calculateRPOCompliance(defaultInput, defaultTarget);
        setCalculationResult(result);
      } else {
        throw new Error("Invalid response format from /api/rpo-targets");
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to connect to RPO backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleCalculate = (input: RPOInput) => {
    const matchedTarget = findMatchingTarget(
      targets,
      input.jurisdiction,
      input.entityType,
      input.compliancePeriod
    );
    const result = calculateRPOCompliance(input, matchedTarget);
    setCalculationResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Compliance Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Renewable Purchase Obligation (RPO) Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Verify actual green power procurement percentages against mandated Ministry
              of Power and State SERC trajectory targets. Calculates precise compliance
              shortfalls and CERC Renewable Energy Certificate (REC) equivalent requirements.
            </p>
          </div>

          {/* Backend Connection Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-3 text-xs">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Connected API
                </span>
                <span className="font-mono text-emerald-300 font-medium">
                  GET /api/rpo-targets
                </span>
              </div>
              <button
                onClick={fetchTargets}
                disabled={isLoading}
                title="Reload Targets"
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
              onClick={fetchTargets}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Two-Column Working Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-5">
            <RpoForm onCalculate={handleCalculate} isLoading={isLoading} />
          </div>

          {/* Right Column: Calculated Results & Provenance (7 cols) */}
          <div className="lg:col-span-7">
            <RpoResultCard result={calculationResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
