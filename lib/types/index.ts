// Shared TypeScript types index — all three Members import from here
// Member 1 (Frontend): types for dashboard rendering
// Member 2 (Backend): types for API response serialization
// Member 3 (Decision Tools): types for RPO/Solar/Jobs modules

export type { BaseApiResponse, ApiResponseStatus } from './api';
export type {
  FuelCategoryBreakdown,
  InstalledCapacityData,
  ElectricityGenerationData,
  CoalVsRenewableComparison,
  HistoricalTrendPoint,
  EnergyMixPayload,
  EnergyMixResponse,
} from './energy-mix';
