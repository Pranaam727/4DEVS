"use client";

import React, { useState, useEffect, useMemo } from "react";
import JobCard from "@/components/jobs/JobCard";
import JobsFilter from "@/components/jobs/JobsFilter";
import { GreenJob, JobsFilterState } from "@/lib/types/jobs";
import { filterGreenJobs, extractJobFilterOptions } from "@/lib/calculations/jobs";
import {
  Briefcase,
  Database,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ShieldCheck,
  SearchX,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<GreenJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [filters, setFilters] = useState<JobsFilterState>({
    searchQuery: "",
    selectedLocation: "ALL",
    selectedCategory: "ALL",
    selectedOrgType: "ALL",
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) {
        throw new Error(`Failed to load jobs: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        throw new Error("Invalid response format from /api/jobs");
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to connect to jobs backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter options derived from genuine listings
  const { locations, categories } = useMemo(() => {
    return extractJobFilterOptions(jobs);
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return filterGreenJobs(jobs, filters);
  }, [jobs, filters]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Decarbonization Workforce Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Green Energy Jobs Discovery Board
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Discover verified technical, regulatory, and managerial vacancies
              across India’s premier clean energy Public Sector Undertakings (PSUs),
              national renewable energy institutes, and state nodal agencies.
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
                  GET /api/jobs
                </span>
              </div>
              <button
                onClick={fetchJobs}
                disabled={isLoading}
                title="Reload Jobs"
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
              onClick={fetchJobs}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <JobsFilter
          filters={filters}
          onFilterChange={setFilters}
          availableLocations={locations}
          availableCategories={categories}
          totalMatches={filteredJobs.length}
        />

        {/* Results Area */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-sm font-medium">
              Retrieving verified Indian clean energy job listings...
            </p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State: No jobs in database at all */
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-lg mx-auto space-y-3">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">
              No Verified Listings Currently Available
            </h3>
            <p className="text-xs text-slate-500">
              In accordance with our strict Zero Demo Data Policy, we only surface
              active listings verified through official PSU and institutional
              gazettes. Please check back soon or trigger a reload.
            </p>
          </div>
        ) : (
          /* Empty State: Filters returned no match */
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 max-w-lg mx-auto space-y-3">
            <SearchX className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">
              No Listings Match Your Selected Filters
            </h3>
            <p className="text-xs text-slate-500">
              No verified opportunities match query &quot;{filters.searchQuery}&quot; in{" "}
              {filters.selectedLocation !== "ALL" ? filters.selectedLocation : "India"} for{" "}
              {filters.selectedCategory !== "ALL" ? filters.selectedCategory : "all categories"}.
            </p>
            <button
              onClick={() =>
                setFilters({
                  searchQuery: "",
                  selectedLocation: "ALL",
                  selectedCategory: "ALL",
                  selectedOrgType: "ALL",
                })
              }
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
