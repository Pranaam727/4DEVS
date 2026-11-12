"use client";

import React from "react";
import { JobsFilterState } from "@/lib/types/jobs";
import { Search, MapPin, Tag, X, Filter } from "lucide-react";

interface JobsFilterProps {
  filters: JobsFilterState;
  onFilterChange: (filters: JobsFilterState) => void;
  availableLocations: string[];
  availableCategories: string[];
  totalMatches: number;
}

export default function JobsFilter({
  filters,
  onFilterChange,
  availableLocations,
  availableCategories,
  totalMatches,
}: JobsFilterProps) {
  const handleSearchChange = (q: string) => {
    onFilterChange({ ...filters, searchQuery: q });
  };

  const handleLocationChange = (loc: string) => {
    onFilterChange({ ...filters, selectedLocation: loc });
  };

  const handleCategoryChange = (cat: string) => {
    onFilterChange({ ...filters, selectedCategory: cat });
  };

  const handleClearFilters = () => {
    onFilterChange({
      searchQuery: "",
      selectedLocation: "ALL",
      selectedCategory: "ALL",
      selectedOrgType: "ALL",
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== "" ||
    (filters.selectedLocation !== "ALL" && filters.selectedLocation !== "") ||
    (filters.selectedCategory !== "ALL" && filters.selectedCategory !== "");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Filter Verified Listings</h3>
          <span className="text-xs bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
            {totalMatches} {totalMatches === 1 ? "Role" : "Roles"} Found
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search role, skills, agency..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
          <select
            value={filters.selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none font-medium"
          >
            <option value="ALL">All Locations across India</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
          <select
            value={filters.selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none font-medium"
          >
            <option value="ALL">All Clean Energy Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
