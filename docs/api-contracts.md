# INDIA GREEN GRID — API CONTRACT SPECIFICATION
**Version:** 1.0.0  
**Backend Architect:** Member 2 (Senior Backend Engineer & Database Architect)  
**Applicability:** Shared contract for Member 1 (Frontend), Member 2 (Backend), and Member 3 (Integration/DevOps)

---

## 1. Global Response Envelope

All API endpoints under `/api/*` MUST strictly conform to one of the following two standard JSON response structures:

### A. Successful Response (HTTP 200)

```typescript
export interface ApiSuccessResponse<T> {
  status: 'success';
  asOf: string;          // Official publication date (e.g., "2025-03-31")
  retrievedAt: string;   // ISO 8601 fetch timestamp
  source: string;        // Official authority name
  sourceUrl: string;     // Verifiable URL
  data: T;               // Strongly typed payload
}
```

```json
{
  "status": "success",
  "asOf": "2025-03-31",
  "retrievedAt": "2026-11-12T07:00:22.572Z",
  "source": "Central Electricity Authority (CEA) & National Power Portal (NPP)",
  "sourceUrl": "https://cea.nic.in/executive-summary/?lang=en",
  "data": {}
}
```

### B. Honest Unavailable Response (HTTP 200 / 503)

Returned when upstream sources fail, rate limits trigger, or network timeouts occur. **Never fabricate fake data.**

```typescript
export interface ApiUnavailableResponse {
  status: 'unavailable';
  asOf: null;
  retrievedAt: string | null;
  source: null;
  sourceUrl: null;
  message: string;       // Human-readable technical explanation
  data: null;
}
```

```json
{
  "status": "unavailable",
  "asOf": null,
  "retrievedAt": "2026-11-12T07:02:57.739Z",
  "source": null,
  "sourceUrl": null,
  "message": "Upstream job portal (National Career Service) is currently unavailable: Undergoing scheduled maintenance and cannot be queried.",
  "data": null
}
```

---

## 2. Endpoints Catalog

### Endpoint 1: Energy Mix
- **Method:** `GET`
- **Route:** `/api/energy-mix`
- **Purpose:** All-India verified power capacity, actual generation, coal vs clean metrics, regional distribution, and historical additions.
- **Rule:** Strictly separates **Capacity (MW)** from **Actual Generation (MU)**.
- **Headers Returned:**
  - `X-Data-Freshness`: `fresh` | `stale`
  - `X-Data-Age`: Age in seconds
  - `Cache-Control`: `public, s-maxage=3600, stale-while-revalidate=86400`
- **Response Payload (`data`):**
  - `capacity`: Thermal (Coal, Lignite, Gas, Diesel), Nuclear, Large Hydro, RES (Solar, Wind, Small Hydro, Bio-Power, Waste-to-Energy), Totals (MW, GW), nonFossilSharePercent, fossilSharePercent.
  - `generation`: Thermal MU, Nuclear MU, Hydro MU, RES MU, Total Generation MU, Coal Share %, Renewable Share %.
  - `comparison`: Coal vs RES+Hydro capacity and generation ratios, crossover status.
  - `historical`: Array of FY 2021-22 to FY 2024-25 capacity additions. (Zero vs. missing: baseline year growth is `null`).
  - `regional`: Northern, Western, Southern, Eastern, North Eastern capacity breakdowns.

---

### Endpoint 2: Renewable Purchase Obligation (RPO) Targets
- **Method:** `GET`
- **Route:** `/api/rpo-targets`
- **Query Parameters:**
  - `state` *(optional)*: State code (e.g., `?state=MH` for Maharashtra, `?state=GJ` for Gujarat).
  - `year` *(optional)*: Financial year filter (e.g., `?year=2026-27`).
- **Response Payload (`data`):**
  - `nationalTrajectory`: Yearly targets from FY 2024-25 through FY 2029-30 (Wind RPO, HPO, Other RPO, Energy Storage Obligation, Total RPO scaling to 43.33%).
  - `obligatedEntities`: DISCOMs, Commercial & Industrial Open Access Consumers (threshold >= 100 kW), Captive Power Plants (CPPs).
  - `stateRegulations`: SERC-specific state regulations (MERC, GERC, KERC, TNERC, DERC, UPERC).
  - `regulatoryReferences`: Ministry of Power orders (Order No. 09/11/2021-RCM, F.No. 23/03/2023-R&R).

---

### Endpoint 3: Solar Assumptions & PM Surya Ghar Subsidies
- **Method:** `GET`
- **Route:** `/api/solar-assumptions`
- **Query Parameters:**
  - `state` *(optional)*: State filter (e.g., `?state=DL`).
  - `capacityKw` *(optional)*: Requested installation capacity (e.g., `?capacityKw=3` or `?capacityKw=5`).
- **Response Payload (`data`):**
  - `schemeName`: "PM Surya Ghar: Muft Bijli Yojana"
  - `subsidySlabs`:
    - 1 kW: ₹30,000
    - 2 kW: ₹60,000 (₹30,000/kW)
    - 3 kW+: ₹78,000 (fixed maximum CFA cap for residential individual connections)
  - `groupHousingSubsidy`: ₹18,000/kW up to 500 kW.
  - `benchmarkCosts`: Benchmark gross and net cost estimates for 1, 2, 3, 5, and 10 kW systems.
  - `tailoredCalculation` *(when `capacityKw` is passed)*:
    - Calculates exact eligible subsidy (capped at ₹78k for >=3kW).
    - Expected annual generation in kWh.
    - Estimated annual savings and payback duration in years.
  - `statePolicies`: Retail electricity tariff slabs, state top-up subsidies (e.g., UP ₹30k top-up, Delhi GBI), and net metering policies.

---

### Endpoint 4: Green Jobs
- **Method:** `GET`
- **Route:** `/api/jobs`
- **Query Parameters:**
  - `category` *(optional)*: Filter by sector (`solar`, `wind`, `energy_storage`, `electric_vehicles`, `grid_operations`, `green_hydrogen`).
  - `location` *(optional)*: Filter by city or state.
  - `simulate_unavailable` *(optional)*: Set to `true` to test honest unavailable fallback.
- **Integrity Rule:** Sourced strictly from Skill Council for Green Jobs (SCGJ), National Career Service (NCS), and clean energy PSUs (SECI, NGEL, Grid-India). If upstream is unreachable, returns honest unavailable state. Never manufactures vacancies.
