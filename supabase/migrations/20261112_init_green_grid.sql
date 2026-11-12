-- ==============================================================================
-- INDIA GREEN GRID — PRODUCTION DATABASE SCHEMA & INITIAL MIGRATION
-- Database: PostgreSQL 14+ / Supabase
-- Architect: Member 2 (Senior Backend Engineer & Database Architect)
-- ==============================================================================

-- 1. DATA SOURCE METADATA
-- Tracks data provenance, publication frequency, uptime, and last verified check
CREATE TABLE IF NOT EXISTS data_source_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'CEA', 'MNRE', 'GRID_INDIA', 'CPCB', 'SCGJ', 'NCS'
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    official_url TEXT NOT NULL,
    update_frequency VARCHAR(50) NOT NULL CHECK (update_frequency IN ('daily', 'monthly', 'annual', 'as_notified')),
    geographic_coverage VARCHAR(100) NOT NULL DEFAULT 'All India',
    last_checked_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'unavailable', 'deprecated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTALLED CAPACITY DATASETS (Megawatts - MW)
-- Strictly separates INSTALLED CAPACITY (MW) from ELECTRICITY GENERATION (MU)
CREATE TABLE IF NOT EXISTS energy_capacity_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    as_of_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('daily', 'monthly', 'annual')),
    source_id UUID REFERENCES data_source_metadata(id) ON DELETE RESTRICT,
    
    -- Conventional Thermal Breakup (MW)
    coal_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (coal_mw >= 0),
    lignite_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (lignite_mw >= 0),
    gas_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (gas_mw >= 0),
    diesel_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (diesel_mw >= 0),
    total_thermal_mw NUMERIC(12, 2) GENERATED ALWAYS AS (coal_mw + lignite_mw + gas_mw + diesel_mw) STORED,

    -- Nuclear & Large Hydro (MW)
    nuclear_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (nuclear_mw >= 0),
    large_hydro_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (large_hydro_mw >= 0),

    -- Renewable Energy Sources (RES) Breakup (MW)
    solar_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (solar_mw >= 0),
    wind_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (wind_mw >= 0),
    small_hydro_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (small_hydro_mw >= 0),
    bio_power_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (bio_power_mw >= 0),
    waste_to_energy_mw NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (waste_to_energy_mw >= 0),
    total_res_mw NUMERIC(12, 2) GENERATED ALWAYS AS (solar_mw + wind_mw + small_hydro_mw + bio_power_mw + waste_to_energy_mw) STORED,

    -- Total All-India Installed Capacity (MW)
    total_capacity_mw NUMERIC(12, 2) GENERATED ALWAYS AS (
        coal_mw + lignite_mw + gas_mw + diesel_mw + nuclear_mw + large_hydro_mw +
        solar_mw + wind_mw + small_hydro_mw + bio_power_mw + waste_to_energy_mw
    ) STORED,

    is_official_publication BOOLEAN NOT NULL DEFAULT true,
    report_reference TEXT,
    source_url TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_capacity_as_of_period UNIQUE (as_of_date, period_type)
);

-- 3. ELECTRICITY GENERATION DATASETS (Million Units - MU = GWh)
CREATE TABLE IF NOT EXISTS energy_generation_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_label VARCHAR(50) NOT NULL, -- e.g. "FY 2024-25" or "2024-10"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source_id UUID REFERENCES data_source_metadata(id) ON DELETE RESTRICT,

    -- Thermal Generation (MU)
    coal_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (coal_mu >= 0),
    lignite_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (lignite_mu >= 0),
    gas_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (gas_mu >= 0),
    diesel_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (diesel_mu >= 0),
    total_thermal_mu NUMERIC(14, 2) GENERATED ALWAYS AS (coal_mu + lignite_mu + gas_mu + diesel_mu) STORED,

    -- Nuclear & Large Hydro (MU)
    nuclear_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (nuclear_mu >= 0),
    large_hydro_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (large_hydro_mu >= 0),

    -- Renewable Energy Sources (RES) Generation (MU)
    solar_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (solar_mu >= 0),
    wind_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (wind_mu >= 0),
    biomass_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (biomass_mu >= 0),
    small_hydro_mu NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (small_hydro_mu >= 0),
    total_res_mu NUMERIC(14, 2) GENERATED ALWAYS AS (solar_mu + wind_mu + biomass_mu + small_hydro_mu) STORED,

    total_generation_mu NUMERIC(14, 2) NOT NULL CHECK (total_generation_mu >= 0),
    report_reference TEXT,
    source_url TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_generation_period_label UNIQUE (period_label)
);

-- 4. RENEWABLE PURCHASE OBLIGATION (RPO) TRAJECTORY
CREATE TABLE IF NOT EXISTS rpo_trajectory_regulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_year VARCHAR(20) NOT NULL UNIQUE, -- e.g. "2024-25", "2025-26"
    wind_rpo_percent NUMERIC(5, 2) NOT NULL CHECK (wind_rpo_percent >= 0 AND wind_rpo_percent <= 100),
    hydro_purchase_obligation_percent NUMERIC(5, 2) NOT NULL CHECK (hydro_purchase_obligation_percent >= 0 AND hydro_purchase_obligation_percent <= 100),
    other_rpo_percent NUMERIC(5, 2) NOT NULL CHECK (other_rpo_percent >= 0 AND other_rpo_percent <= 100),
    energy_storage_obligation_percent NUMERIC(5, 2) NOT NULL CHECK (energy_storage_obligation_percent >= 0 AND energy_storage_obligation_percent <= 100),
    total_rpo_percent NUMERIC(5, 2) NOT NULL CHECK (total_rpo_percent >= 0 AND total_rpo_percent <= 100),
    governing_order_number VARCHAR(100) NOT NULL,
    issuing_authority VARCHAR(100) NOT NULL DEFAULT 'Ministry of Power',
    effective_date DATE NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STATE SOLAR ASSUMPTIONS & POLICIES
CREATE TABLE IF NOT EXISTS state_solar_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(10) NOT NULL UNIQUE, -- e.g. "MH", "GJ", "KA", "DL"
    state_name VARCHAR(100) NOT NULL,
    serc_name VARCHAR(200) NOT NULL,
    discom_names TEXT[] NOT NULL DEFAULT '{}',
    avg_domestic_tariff_inr NUMERIC(6, 2) NOT NULL CHECK (avg_domestic_tariff_inr >= 0),
    tariff_slabs_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    state_additional_subsidy_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (state_additional_subsidy_inr >= 0),
    net_metering_cap_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
    state_policy_notes TEXT,
    order_reference TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. GREEN JOB LISTINGS (AUTHENTIC RECORDS ONLY)
CREATE TABLE IF NOT EXISTS green_job_listings (
    id VARCHAR(128) PRIMARY KEY, -- Deterministic SHA-256 hash of (organization + title + url) to prevent duplicates
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'solar', 'wind', 'energy_storage', 'electric_vehicles',
        'grid_operations', 'energy_efficiency', 'policy_and_regulatory',
        'bioenergy', 'green_hydrogen', 'other'
    )),
    listing_url TEXT NOT NULL,
    posting_date DATE,
    source_code VARCHAR(50) NOT NULL REFERENCES data_source_metadata(source_code) ON UPDATE CASCADE,
    employment_type VARCHAR(50) DEFAULT 'full-time',
    description_snippet TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_energy_capacity_as_of ON energy_capacity_datasets(as_of_date DESC);
CREATE INDEX IF NOT EXISTS idx_energy_generation_period ON energy_generation_datasets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rpo_fy ON rpo_trajectory_regulations(financial_year);
CREATE INDEX IF NOT EXISTS idx_solar_state_code ON state_solar_assumptions(state_code);
CREATE INDEX IF NOT EXISTS idx_jobs_category_location ON green_job_listings(category, location);
CREATE INDEX IF NOT EXISTS idx_jobs_posting_date ON green_job_listings(posting_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON green_job_listings(is_active) WHERE is_active = true;

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_data_source_metadata_updated_at
BEFORE UPDATE ON data_source_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_rpo_trajectory_regulations_updated_at
BEFORE UPDATE ON rpo_trajectory_regulations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_state_solar_assumptions_updated_at
BEFORE UPDATE ON state_solar_assumptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
