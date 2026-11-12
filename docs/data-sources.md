# INDIA GREEN GRID — OFFICIAL DATA SOURCE INVESTIGATION & AUDIT
**Author:** Member 2 (Senior Backend Engineer, Database Architect & Integration Specialist)  
**Investigation Date:** November 2026  
**Scope:** Exhaustive evaluation of official Indian energy, electricity, regulatory, and labor data sources.

---

## Executive Summary

Before writing any integration code, an exhaustive technical audit of actual public data availability was conducted across India's premier energy bodies:
1. **Central Electricity Authority (CEA)**
2. **Ministry of New and Renewable Energy (MNRE)**
3. **Grid Controller of India Limited (Grid-India, formerly POSOCO)**
4. **Central Pollution Control Board (CPCB)**
5. **Ministry of Power & State Electricity Regulatory Commissions (SERCs)**
6. **Skill Council for Green Jobs (SCGJ) & National Career Service (NCS)**

### Key Technical Finding:
**Official government web portals in India rarely offer open, unauthenticated REST/JSON endpoints.** Most operational data is disseminated as:
- Periodic formal PDF and Excel gazettes / executive reports.
- Access-controlled enterprise APIs (via the National Power Database Management System - NPDMS, National Career Service developer portal, or Open Government Data Platform India - `data.gov.in`).
- Real-time frontend portal bundles (e.g., MERIT India, Vidyut Pravah).

To prevent system failure and guarantee 100% data honesty, the backend implements a **Dual-Mode Architectural Pipeline**:
1. **Live Upstream Mode:** Polls official open data APIs (`api.data.gov.in`, NCS developer API) when configured with verified credentials.
2. **Verified Authoritative Baseline:** Serves normalized, officially published datasets (with publication date, report citation, and direct URL) when API credentials are absent or upstream services suffer network outages/rate limits.
3. **Honest Unavailable State:** If an upstream query cannot be fulfilled and no verified baseline exists (e.g. dynamic live job listings), the API returns an explicit `"status": "unavailable"` response with root-cause diagnostics. **Under no circumstances is fake data fabricated.**

---

## 1. Central Electricity Authority (CEA) & National Power Portal (NPP)

| Parameter | Finding |
| :--- | :--- |
| **Official Portals** | `https://cea.nic.in` & `https://npp.gov.in` |
| **Data Scope** | Installed generation capacity (MW), generation statistics (MU / GWh), peak demand vs. met, transmission capacity. |
| **Direct REST APIs** | CEA hosts an internal API data portal connected to NPDMS, but direct endpoints require departmental registration and IP whitelisting. |
| **Open Data Access** | Open Government Data Platform India (`data.gov.in`) hosts cataloged CEA datasets accessible via API key. |
| **Downloadable Formats** | Monthly Executive Summary (PDF & XLSX); Daily Generation Reports (DGR - PDF & XLS). |
| **Publication Frequency** | Installed capacity: Monthly (published ~15-20 days following month end); Generation: Daily logs compiled monthly. |
| **Geographic Coverage** | All-India, 5 electrical regions (Northern, Western, Southern, Eastern, North Eastern), and state-level. |
| **Unit Convention** | Capacity in **Megawatts (MW)** or **Gigawatts (GW)**; Generation in **Million Units (MU)**, where $1\text{ MU} = 1\text{ GWh} = 10^6\text{ kWh}$. |
| **Technical Separation** | Capacity measures theoretical maximum output at peak rating; Generation measures actual electrical energy produced over time. **These metrics are kept strictly separate in the schema.** |
| **Backend Ingestion Method** | Sourced from the authoritative CEA Monthly Executive Summary (March 2025 FY 2024-25 year-end compilation) with optional live sync against `api.data.gov.in/resource/cea-installed-capacity` via `DATA_GOV_IN_API_KEY`. |

---

## 2. Ministry of New and Renewable Energy (MNRE) & PM Surya Ghar

| Parameter | Finding |
| :--- | :--- |
| **Official Portals** | `https://mnre.gov.in` & `https://pmsuryaghar.gov.in` |
| **Data Scope** | Physical progress achievements, technology-wise RE capacity additions, PM Surya Ghar: Muft Bijli Yojana subsidy slabs, technical standards. |
| **Direct REST APIs** | The PM Surya Ghar portal operates DISCOM synchronization workflows for empanelled vendors; no unauthenticated public developer API exists. |
| **Downloadable Formats** | Monthly physical achievement reports (PDF), official subsidy notifications (Gazette of India orders). |
| **Publication Frequency** | Monthly physical reports; Policy notifications as issued by Union Cabinet / MNRE. |
| **Subsidy Slabs (PM Surya Ghar)** | - **1 kW:** ₹30,000 flat.<br>- **2 kW:** ₹60,000 flat (₹30,000/kW).<br>- **3 kW:** ₹78,000 (₹60,000 + ₹18,000 for 3rd kW).<br>- **> 3 kW:** Capped strictly at **₹78,000** for residential connections.<br>- **Group Housing / RWAs:** ₹18,000/kW up to 500 kW. |
| **Benchmark Costs** | ₹50,000 – ₹65,000 per kW (including mono-PERC/TOPCon modules, grid-tie inverter, cabling, bidirectional meter). |
| **Restrictions** | Mandatory Domestic Content Requirement (DCR) solar cells/modules with ALMM certification; empanelled vendor execution required for subsidy release. |
| **Backend Ingestion Method** | Standardized rules engine matching MNRE Notification No. 318/63/2023-GCRT with state-level SERC tariff and GBI data. |

---

## 3. Ministry of Power & SERC Renewable Purchase Obligation (RPO)

| Parameter | Finding |
| :--- | :--- |
| **Governing Authority** | Ministry of Power (MoP) & State Electricity Regulatory Commissions (SERCs). |
| **Governing Statute** | Section 86(1)(e) of the Electricity Act 2003 & Energy Conservation (Amendment) Act 2022. |
| **Regulatory Orders** | - MoP Order No. 09/11/2021-RCM dated 22nd July 2022.<br>- MoP Order F.No. 23/03/2023-R&R dated 20th October 2023. |
| **Trajectory Targets** | - **FY 2024-25:** Wind 2.46%, HPO 1.08%, Other RE 26.37%, ESO 1.50% $\rightarrow$ **Total 29.91%**<br>- **FY 2025-26:** Wind 3.36%, HPO 1.48%, Other RE 28.29%, ESO 2.00% $\rightarrow$ **Total 33.13%**<br>- **FY 2026-27:** Wind 4.04%, HPO 1.80%, Other RE 30.11%, ESO 2.50% $\rightarrow$ **Total 35.95%**<br>- **FY 2027-28:** Wind 5.46%, HPO 2.15%, Other RE 30.56%, ESO 3.00% $\rightarrow$ **Total 38.17%**<br>- **FY 2028-29:** Wind 6.00%, HPO 2.51%, Other RE 31.95%, ESO 3.50% $\rightarrow$ **Total 40.46%**<br>- **FY 2029-30:** Wind 6.94%, HPO 2.82%, Other RE 33.57%, ESO 4.00% $\rightarrow$ **Total 43.33%** |
| **Obligated Entities** | 1. **DISCOMs:** Distribution licensees.<br>2. **Open Access Consumers:** Commercial/Industrial consumers with contracted load $\ge 100\text{ kW}$ under Green Energy Open Access Rules 2022.<br>3. **Captive Power Plants (CPPs):** Fossil-based captive generation. |
| **Non-Universality** | RPO is **not universal** across states. SERCs (MERC, GERC, KERC, TNERC, DERC, UPERC) issue state-specific regulations with local carve-outs. |
| **Backend Ingestion Method** | Structured regulatory database mapping national trajectory and state-specific SERC deviations. |

---

## 4. Grid-India (Grid Controller of India Limited / POSOCO)

| Parameter | Finding |
| :--- | :--- |
| **Official Portal** | `https://grid-india.in` |
| **Portals Maintained** | National Load Despatch Centre (NLDC), 5 RLDCs, MERIT India (`meritindia.in`), Vidyut Pravah (`vidyutpravah.in`). |
| **Data Scope** | 15-minute time block regional demand met, grid frequency, marginal variable cost of dispatch, transmission corridor availability (ATC/TTC). |
| **Public API Status** | Grid-India operates internal telemetry protocols (ICCP / TASE.2) and secure web services for system operators. No unrestricted open public JSON API is exposed to third parties without MOU/credentials. |
| **Access Consideration** | Real-time dashboards on MERIT India and Vidyut Pravah fetch lightweight client-side JSON feeds. Scraping these unauthenticated endpoints is subject to IP throttling, CAPTCHAs, and terms of service changes. |
| **Backend Integration Strategy** | Metadata model and database schema support automated ingestion when Grid-India dispatch feeds or institutional access tokens are supplied. |

---

## 5. Central Pollution Control Board (CPCB)

| Parameter | Finding |
| :--- | :--- |
| **Official Portals** | `https://cpcb.nic.in` & National Air Quality Index (`airquality.cpcb.gov.in`) |
| **Data Scope** | Continuous Ambient Air Quality Monitoring (CAAQMS), Continuous Emission Monitoring Systems (CEMS) for thermal power generation units ($SO_2$, $NO_x$, Particulate Matter). |
| **API Availability** | CAAQMS data is exposed via the Open Government Data Platform India (`data.gov.in/resource/real-time-air-quality-index`) requiring a registered API token. |
| **Limitations** | Frequent sensor calibration downtime across individual monitoring stations; data represents ambient concentrations rather than stack emissions. |

---

## 6. Skill Council for Green Jobs (SCGJ) & National Career Service (NCS)

| Parameter | Finding |
| :--- | :--- |
| **Official Portals** | `https://sscgj.in` & `https://www.ncs.gov.in` |
| **Data Scope** | National Occupational Standards (NOS), certified training partners, Suryamitra training programs, green energy public PSU recruitment notices. |
| **Public API Status** | NCS maintains a partner developer gateway (`ncs.gov.in`) requiring government registration and authorization tokens. SCGJ publishes career opportunities as public recruitment circulars and tender notices. |
| **Integrity Constraint** | **Never manufacture or fabricate job vacancies.** If the upstream NCS gateway is not configured or times out, the backend serves authentic, verified public clean energy listings (SCGJ, SECI, NTPC Green Energy) or returns an explicit `"status": "unavailable"` response. |
| **Backend Integration Method** | Hybrid engine: polls live NCS gateway if `NCS_API_KEY` is present; falls back to verified PSU/SCGJ notices; returns honest unavailable payload if requested or during outages. |
