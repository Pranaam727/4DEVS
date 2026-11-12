/**
 * INDIA GREEN GRID — GREEN JOBS TYPES
 * Unified contracts for Member 2 (Backend) and Member 3 (Calculation & UI)
 */

export type GreenJobCategory =
  | "Solar Energy"
  | "Wind Energy"
  | "Energy Storage & EV"
  | "Grid Operations & Smart Grid"
  | "Green Hydrogen & Bioenergy"
  | "Sustainability & ESG"
  | "Policy & Energy Regulatory"
  | 'solar'
  | 'wind'
  | 'energy_storage'
  | 'electric_vehicles'
  | 'grid_operations'
  | 'energy_efficiency'
  | 'policy_and_regulatory'
  | 'bioenergy'
  | 'green_hydrogen'
  | 'other';

export interface GreenJob {
  id: string;
  title: string;
  organization: string;
  organizationType: "Public Sector Undertaking (PSU)" | "Autonomous Body" | "Private CleanTech" | "Research Institution" | "Regulatory Body" | string;
  location: string;
  state: string;
  category: GreenJobCategory | string;
  employmentType: "Full-Time" | "Contract / Project-Based" | "Consultancy" | "Fellowship" | string;
  experienceLevel: "Entry Level" | "Mid Level" | "Senior / Lead" | "Executive" | string;
  postingDate: string | null;
  applicationDeadline: string | null;
  originalSource: string;
  sourceUrl: string;
  retrievalTimestamp: string;
  descriptionSnippet: string;
  keySkills: string[];
  isVerifiedListing: boolean;
}

export interface JobsFilterState {
  searchQuery: string;
  selectedLocation: string;
  selectedCategory: string;
  selectedOrgType?: string;
}

export interface JobsApiResponse {
  success: boolean;
  totalCount: number;
  retrievalTimestamp: string;
  sourceAuthority: string;
  jobs: GreenJob[];
}

export interface GreenJobListing {
  id: string;
  title: string;
  organization: string;
  location: string;
  state: string | null;
  category: GreenJobCategory;
  url: string;
  postingDate: string | null;
  source: string;
  retrievedAt: string;
  employmentType?: 'full-time' | 'contract' | 'apprenticeship' | 'part-time';
  descriptionSnippet?: string;
  applicationDeadline?: string | null;
}

export interface GreenJobsData {
  listings: GreenJobListing[];
  totalCount: number;
  categoriesAvailable: GreenJobCategory[];
  locationsAvailable: string[];
  integrationMode: 'live_upstream_api' | 'official_curated_feed' | 'unavailable';
  officialSourceDisclaimer: string;
}
