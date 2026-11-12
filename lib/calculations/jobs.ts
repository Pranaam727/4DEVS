import { GreenJob, JobsFilterState } from "../types/jobs";

/**
 * Filters and searches green job listings based on query, location, and category.
 */
export function filterGreenJobs(
  jobs: GreenJob[],
  filters: JobsFilterState
): GreenJob[] {
  if (!jobs || !Array.isArray(jobs)) return [];

  return jobs.filter((job) => {
    // 1. Search Query filter (matches title, organization, or skills)
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.trim().toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(q);
      const orgMatch = job.organization.toLowerCase().includes(q);
      const skillMatch = job.keySkills?.some((skill) =>
        skill.toLowerCase().includes(q)
      );
      const descMatch = job.descriptionSnippet?.toLowerCase().includes(q);

      if (!titleMatch && !orgMatch && !skillMatch && !descMatch) {
        return false;
      }
    }

    // 2. Location filter
    if (
      filters.selectedLocation &&
      filters.selectedLocation !== "ALL" &&
      filters.selectedLocation.trim() !== ""
    ) {
      const loc = filters.selectedLocation.toLowerCase();
      const jobLoc = job.location.toLowerCase();
      const jobState = job.state.toLowerCase();

      if (!jobLoc.includes(loc) && !jobState.includes(loc)) {
        return false;
      }
    }

    // 3. Category filter
    if (
      filters.selectedCategory &&
      filters.selectedCategory !== "ALL" &&
      filters.selectedCategory.trim() !== ""
    ) {
      if (
        job.category.toLowerCase() !== filters.selectedCategory.toLowerCase()
      ) {
        return false;
      }
    }

    // 4. Organization Type filter (optional)
    if (
      filters.selectedOrgType &&
      filters.selectedOrgType !== "ALL" &&
      filters.selectedOrgType.trim() !== ""
    ) {
      if (
        job.organizationType.toLowerCase() !==
        filters.selectedOrgType.toLowerCase()
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extracts unique categories and locations from genuine listings for filter dropdowns.
 */
export function extractJobFilterOptions(jobs: GreenJob[]) {
  if (!jobs || !Array.isArray(jobs)) {
    return { locations: [], categories: [], orgTypes: [] };
  }

  const locations = Array.from(
    new Set(jobs.map((j) => j.location.split(",")[0].trim()))
  ).sort();

  const categories = Array.from(new Set(jobs.map((j) => j.category))).sort();

  const orgTypes = Array.from(
    new Set(jobs.map((j) => j.organizationType))
  ).sort();

  return { locations, categories, orgTypes };
}
