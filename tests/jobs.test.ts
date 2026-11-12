import { describe, it, expect } from "vitest";
import { filterGreenJobs, extractJobFilterOptions } from "../lib/calculations/jobs";
import { GreenJob, JobsFilterState } from "../lib/types/jobs";

// Synthetic test job listings strictly for automated testing
const SYNTHETIC_JOBS: GreenJob[] = [
  {
    id: "synthetic-solar-lead",
    title: "Lead Solar Engineer",
    organization: "Synthetic Solar Corporation",
    organizationType: "Public Sector Undertaking (PSU)",
    location: "Bengaluru, Karnataka",
    state: "Karnataka",
    category: "Solar Energy",
    employmentType: "Full-Time",
    experienceLevel: "Senior / Lead",
    postingDate: "2024-05-01",
    applicationDeadline: "2024-06-01",
    originalSource: "Synthetic Test Careers",
    sourceUrl: "https://synthetic.example.gov.in/solar",
    retrievalTimestamp: "2024-05-02T00:00:00Z",
    descriptionSnippet: "Design and execution of utility solar farms and battery storage.",
    keySkills: ["PVSyst", "AutoCAD", "High Voltage"],
    isVerifiedListing: true,
  },
  {
    id: "synthetic-wind-scientist",
    title: "Offshore Wind Analyst",
    organization: "Synthetic Wind Agency",
    organizationType: "Autonomous Body",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    category: "Wind Energy",
    employmentType: "Contract / Project-Based",
    experienceLevel: "Mid Level",
    postingDate: "2024-05-10",
    applicationDeadline: "2024-06-15",
    originalSource: "Synthetic Wind Portal",
    sourceUrl: "https://synthetic.example.gov.in/wind",
    retrievalTimestamp: "2024-05-11T00:00:00Z",
    descriptionSnippet: "Offshore wind resource analysis using LiDAR datasets.",
    keySkills: ["LiDAR", "WAsP", "GIS"],
    isVerifiedListing: true,
  },
  {
    id: "synthetic-ev-manager",
    title: "EV Grid Infrastructure Manager",
    organization: "Synthetic Grid Power",
    organizationType: "Public Sector Undertaking (PSU)",
    location: "New Delhi",
    state: "Delhi",
    category: "Energy Storage & EV",
    employmentType: "Full-Time",
    experienceLevel: "Senior / Lead",
    postingDate: null, // Test unlisted posting date
    applicationDeadline: null,
    originalSource: "Synthetic Grid Gazette",
    sourceUrl: "https://synthetic.example.gov.in/ev",
    retrievalTimestamp: "2024-05-15T00:00:00Z",
    descriptionSnippet: "EV charging depot power connections and grid impact analysis.",
    keySkills: ["OCPP", "Fast Charging", "Distribution"],
    isVerifiedListing: true,
  },
];

describe("Green Jobs Filtering & Discovery Engine", () => {
  describe("Search by Title and Keywords", () => {
    it("matches job title case-insensitively", () => {
      const filters: JobsFilterState = {
        searchQuery: "solar",
        selectedLocation: "ALL",
        selectedCategory: "ALL",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("synthetic-solar-lead");
    });

    it("matches skills token in search query", () => {
      const filters: JobsFilterState = {
        searchQuery: "lidar",
        selectedLocation: "ALL",
        selectedCategory: "ALL",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("synthetic-wind-scientist");
    });

    it("matches organization name in search query", () => {
      const filters: JobsFilterState = {
        searchQuery: "Synthetic Grid Power",
        selectedLocation: "ALL",
        selectedCategory: "ALL",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("synthetic-ev-manager");
    });
  });

  describe("Filtering by Location and Category", () => {
    it("filters accurately by city / location", () => {
      const filters: JobsFilterState = {
        searchQuery: "",
        selectedLocation: "Chennai",
        selectedCategory: "ALL",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("synthetic-wind-scientist");
    });

    it("filters accurately by category", () => {
      const filters: JobsFilterState = {
        searchQuery: "",
        selectedLocation: "ALL",
        selectedCategory: "Wind Energy",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].category).toBe("Wind Energy");
    });

    it("applies multiple filters conjunctively", () => {
      const filters: JobsFilterState = {
        searchQuery: "lead",
        selectedLocation: "Bengaluru",
        selectedCategory: "Solar Energy",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("synthetic-solar-lead");
    });
  });

  describe("Empty State & Failure Handling", () => {
    it("returns empty array when search returns no match", () => {
      const filters: JobsFilterState = {
        searchQuery: "NonExistentTechnology12345",
        selectedLocation: "ALL",
        selectedCategory: "ALL",
      };
      const result = filterGreenJobs(SYNTHETIC_JOBS, filters);
      expect(result.length).toBe(0);
    });

    it("safely handles null or non-array inputs without crashing", () => {
      const filters: JobsFilterState = {
        searchQuery: "",
        selectedLocation: "ALL",
        selectedCategory: "ALL",
      };
      // @ts-expect-error testing runtime robustness
      expect(filterGreenJobs(null, filters)).toEqual([]);
      // @ts-expect-error testing runtime robustness
      expect(filterGreenJobs(undefined, filters)).toEqual([]);
    });
  });

  describe("Listing Integrity & Links", () => {
    it("ensures every job listing has a valid direct source URL", () => {
      SYNTHETIC_JOBS.forEach((job) => {
        expect(job.sourceUrl).toMatch(/^https?:\/\//);
        expect(job.organization).toBeTruthy();
        expect(job.location).toBeTruthy();
        expect(job.retrievalTimestamp).toBeTruthy();
      });
    });

    it("extracts clean filter options from genuine listings", () => {
      const options = extractJobFilterOptions(SYNTHETIC_JOBS);
      expect(options.locations).toContain("Bengaluru");
      expect(options.locations).toContain("Chennai");
      expect(options.locations).toContain("New Delhi");
      expect(options.categories).toContain("Solar Energy");
      expect(options.categories).toContain("Wind Energy");
      expect(options.categories).toContain("Energy Storage & EV");
    });
  });
});
