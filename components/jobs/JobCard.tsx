"use client";

import React from "react";
import { GreenJob } from "@/lib/types/jobs";
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Clock,
  Briefcase,
  Tag,
} from "lucide-react";

interface JobCardProps {
  job: GreenJob;
}

export default function JobCard({ job }: JobCardProps) {
  // Format dates cleanly
  const formattedPostDate = job.postingDate
    ? new Date(job.postingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not Listed";

  const formattedVerification = new Date(
    job.retrievalTimestamp
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group">
      <div>
        {/* Top Header: Category Tag & Verified Source Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-400" />
            {job.category}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Listing
          </span>
        </div>

        {/* Job Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
          {job.title}
        </h3>

        {/* Organization & Location */}
        <div className="mt-2 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-medium">
            <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-white">{job.organization}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {job.organizationType}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>{job.location}</span>
            <span className="text-slate-600">•</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>{job.employmentType} ({job.experienceLevel})</span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
          {job.descriptionSnippet}
        </p>

        {/* Key Skills */}
        {job.keySkills && job.keySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.keySkills.map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800/80"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Direct Action Link */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Posted: {formattedPostDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <Clock className="w-3 h-3 text-slate-600" />
            <span>Verified: {formattedVerification} | Source: {job.originalSource}</span>
          </div>
        </div>

        {/* Direct Link to Genuine Listing */}
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 rounded-xl font-semibold transition-all text-xs"
        >
          <span>View Official Listing</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
