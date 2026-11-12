"use client";

import React from "react";
import { RPOCalculationResult } from "@/lib/types/rpo";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Scale,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface RpoResultCardProps {
  result: RPOCalculationResult | null;
}

export default function RpoResultCard({ result }: RpoResultCardProps) {
  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-300">
          Awaiting Compliance Parameters
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Enter your total consumption and renewable procurement on the left to
          evaluate statutory RPO obligations and potential shortfall against
          gazetted targets.
        </p>
      </div>
    );
  }

  // Handle Validation Errors / Invalid Input
  if (!result.isValid) {
    return (
      <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-6 text-red-200">
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <h4 className="text-base font-bold text-white">Invalid Input Parameters</h4>
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs text-red-300">
          {result.validationErrors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Status configuration
  const getStatusBadge = () => {
    switch (result.complianceStatus) {
      case "COMPLIANT":
        return {
          icon: CheckCircle2,
          label: "COMPLIANT WITH RPO",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          bannerColor: "bg-emerald-950/60 border-emerald-800",
          description:
            "Renewable procurement meets or satisfies the statutory RPO trajectory.",
        };
      case "SURPLUS":
        return {
          icon: CheckCircle2,
          label: "SURPLUS RENEWABLE PROCUREMENT",
          color: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          bannerColor: "bg-teal-950/60 border-teal-800",
          description: `Exceeded statutory requirement by ${result.surplusMWh.toLocaleString()} MWh. Eligible for voluntary green attributes.`,
        };
      case "SHORTFALL":
        return {
          icon: AlertTriangle,
          label: "RPO SHORTFALL DETECTED",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          bannerColor: "bg-amber-950/60 border-amber-800",
          description: `Obligated shortfall of ${result.shortfallMWh.toLocaleString()} MWh requires compliance remediation via REC purchases or additional PPA.`,
        };
      case "ZERO_CONSUMPTION":
        return {
          icon: Info,
          label: "ZERO CONSUMPTION RECORDED",
          color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          bannerColor: "bg-blue-950/60 border-blue-800",
          description:
            "No electricity consumption recorded for this period. Statutory obligation evaluates to 0.",
        };
      case "TARGET_UNAVAILABLE":
        return {
          icon: Info,
          label: "TARGET NOT FOUND",
          color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          bannerColor: "bg-purple-950/60 border-purple-800",
          description:
            "No verified target matched this specific jurisdiction and period. Calculated actual achievement only.",
        };
      default:
        return {
          icon: Info,
          label: result.complianceStatus,
          color: "bg-slate-700 text-slate-300 border-slate-600",
          bannerColor: "bg-slate-900 border-slate-800",
          description: "",
        };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3.5 ${status.bannerColor}`}
      >
        <StatusIcon className="w-6 h-6 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${status.color}`}
            >
              {status.label}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Normalized: {result.totalConsumptionMWh.toLocaleString()} MWh Base
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {status.description}
          </p>
        </div>
      </div>

      {/* Core Comparative Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Applicable Target */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Applicable RPO Target
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {result.applicableTargetPercent !== null
              ? `${result.applicableTargetPercent.toFixed(2)}%`
              : "N/A"}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Statutory Trajectory
          </span>
        </div>

        {/* Actual Achieved */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Actual RPO Achieved
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              result.applicableTargetPercent !== null &&
              result.actualRpoPercent >= result.applicableTargetPercent
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {result.actualRpoPercent.toFixed(2)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {(
              (result.renewableProcurementMWh /
                (result.totalConsumptionMWh || 1)) *
              100
            ).toFixed(2)}
            % of total load
          </span>
        </div>

        {/* Required Procurement */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            Required Procurement
          </span>
          <div className="text-2xl font-black text-slate-200 mt-1">
            {result.requiredProcurementMWh.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            MWh for compliance
          </span>
        </div>

        {/* Shortfall or Surplus */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-slate-400 block">
            {result.shortfallMWh > 0 ? "Compliance Shortfall" : "Procurement Surplus"}
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              result.shortfallMWh > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {result.shortfallMWh > 0
              ? `${result.shortfallMWh.toLocaleString()}`
              : `+${result.surplusMWh.toLocaleString()}`}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            MWh balance
          </span>
        </div>
      </div>

      {/* Target Breakdown (Wind, Hydro, Other) if available */}
      {result.targetBreakdown && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
          <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Official Target Component Breakdown (MoP Order)
          </h5>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Wind RPO
              </span>
              <p className="text-base font-bold text-cyan-300 mt-0.5">
                {result.targetBreakdown.windRpoPercent.toFixed(2)}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Hydro RPO (HPO)
              </span>
              <p className="text-base font-bold text-blue-300 mt-0.5">
                {result.targetBreakdown.hydroRpoPercent.toFixed(2)}%
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Other RPO (Solar/Bio)
              </span>
              <p className="text-base font-bold text-amber-300 mt-0.5">
                {result.targetBreakdown.otherRpoPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indian REC Equivalence & Market Remediation Insight */}
      {result.shortfallMWh > 0 && result.estimatedRecCostRangeInr && (
        <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              Remediation: Renewable Energy Certificates (REC) Equivalence
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-800">
              1 REC = 1 MWh
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To satisfy this shortfall without physical green power procurement, the
            obligated entity must purchase approximately{" "}
            <strong className="text-white font-mono font-bold">
              {result.recEquivalentRequired.toLocaleString()} RECs
            </strong>{" "}
            from power exchanges (IEX / PXIL).
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-amber-900/40 text-xs">
            <span className="text-slate-400">
              Estimated Exchange Purchase Cost (at ~₹1,000 - ₹1,500/REC):
            </span>
            <span className="font-mono font-bold text-amber-200">
              ₹{result.estimatedRecCostRangeInr.min.toLocaleString()} – ₹
              {result.estimatedRecCostRangeInr.max.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Regulatory Provenance & Source Details */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Regulatory Provenance & Gazette Reference
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block">Regulatory Authority / Order:</span>
            <span className="text-slate-200 font-medium">
              {result.regulatorySource}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Gazette / Order Number:</span>
            <span className="text-slate-200 font-mono font-medium">
              {result.orderNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Effective Date:</span>
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {result.effectiveDate}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Applicability Scope:</span>
            <span className="text-slate-300 text-[11px]">
              {result.applicabilityNotes}
            </span>
          </div>
        </div>
      </div>

      {/* Formulas and Calculation Assumptions Used */}
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-2">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Calculation Assumptions & Applied Formulas
        </h5>
        <div className="space-y-1 font-mono text-[11px] text-slate-400">
          <p>• {result.calculationAssumptions.formulaActualRpo}</p>
          <p>• {result.calculationAssumptions.formulaRequiredProcurement}</p>
          <p>• {result.calculationAssumptions.formulaShortfall}</p>
          <p className="text-slate-500">
            • {result.calculationAssumptions.unitConversions}
          </p>
        </div>
        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800">
          {result.calculationAssumptions.indicativeDisclaimer}
        </p>
      </div>
    </div>
  );
}
