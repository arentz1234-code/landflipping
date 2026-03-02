-- Land Flipping CRM Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE deal_stage AS ENUM (
  'lead',
  'contacted',
  'offer_made',
  'negotiating',
  'under_contract',
  'due_diligence',
  'closed_won',
  'closed_lost',
  'dead'
);

CREATE TYPE contact_type AS ENUM ('buyer', 'seller', 'builder', 'agent', 'other');

CREATE TYPE property_status AS ENUM (
  'researching',
  'mailer_sent',
  'offer_sent',
  'under_contract',
  'owned',
  'listed_for_sale',
  'sold',
  'dead'
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');

-- ============================================
-- TEAM MEMBERS (extends Supabase auth.users)
-- ============================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONTACTS (Buyers, Builders, Sellers, Agents)
-- ============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type contact_type NOT NULL,

  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  phone_secondary TEXT,
  mailing_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- Buyer/Builder-specific fields
  counties_of_interest TEXT[],
  states_of_interest TEXT[],
  min_acreage NUMERIC(10,2),
  max_acreage NUMERIC(10,2),
  min_price_per_acre NUMERIC(12,2),
  max_price_per_acre NUMERIC(12,2),
  max_total_budget NUMERIC(14,2),
  preferred_zoning TEXT[],
  needs_road_access BOOLEAN DEFAULT FALSE,
  needs_utilities BOOLEAN DEFAULT FALSE,
  needs_water BOOLEAN DEFAULT FALSE,
  preferred_terrain TEXT[],
  builder_type TEXT,
  avg_homes_per_year INTEGER,
  preferred_lot_size TEXT,

  -- Seller-specific fields
  motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  asking_price NUMERIC(14,2),
  reason_for_selling TEXT,

  -- Tracking
  source TEXT,
  status TEXT DEFAULT 'active',
  last_contacted_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES team_members(id),
  tags TEXT[],

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROPERTIES / PARCELS
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  apn TEXT,
  address TEXT,
  county TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  legal_description TEXT,

  -- Land details
  acreage NUMERIC(10,2) NOT NULL,
  zoning TEXT,
  terrain TEXT,
  road_access BOOLEAN DEFAULT FALSE,
  road_type TEXT,
  utilities_available TEXT[],
  water_source TEXT,
  flood_zone TEXT,
  hoa BOOLEAN DEFAULT FALSE,
  hoa_fee NUMERIC(10,2),
  restrictions TEXT,
  mineral_rights BOOLEAN DEFAULT TRUE,
  easements TEXT,

  -- Financials
  market_value NUMERIC(14,2),
  tax_assessed_value NUMERIC(14,2),
  annual_taxes NUMERIC(10,2),
  purchase_price NUMERIC(14,2),
  purchase_price_per_acre NUMERIC(12,2),
  asking_price NUMERIC(14,2),
  asking_price_per_acre NUMERIC(12,2),
  sold_price NUMERIC(14,2),
  closing_costs NUMERIC(10,2),
  profit NUMERIC(14,2),

  -- Dates
  acquisition_date DATE,
  listed_date DATE,
  sold_date DATE,

  -- Status & tracking
  status property_status NOT NULL DEFAULT 'researching',
  seller_contact_id UUID REFERENCES contacts(id),
  buyer_contact_id UUID REFERENCES contacts(id),
  assigned_to UUID REFERENCES team_members(id),
  tags TEXT[],

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DEALS (Pipeline tracking)
-- ============================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,

  -- Relationships
  property_id UUID REFERENCES properties(id),
  buyer_contact_id UUID REFERENCES contacts(id),
  seller_contact_id UUID REFERENCES contacts(id),

  -- Pipeline
  stage deal_stage NOT NULL DEFAULT 'lead',
  deal_type TEXT,

  -- Financials
  offer_amount NUMERIC(14,2),
  counter_offer_amount NUMERIC(14,2),
  agreed_price NUMERIC(14,2),
  earnest_money NUMERIC(10,2),
  due_diligence_fee NUMERIC(10,2),
  estimated_profit NUMERIC(14,2),
  commission NUMERIC(10,2),

  -- Dates
  offer_date DATE,
  contract_date DATE,
  due_diligence_deadline DATE,
  closing_date DATE,
  actual_close_date DATE,

  -- Details
  title_company TEXT,
  title_company_contact TEXT,
  title_company_phone TEXT,
  financing_type TEXT,
  seller_finance_terms TEXT,
  contingencies TEXT[],

  -- Tracking
  assigned_to UUID REFERENCES team_members(id),
  priority task_priority DEFAULT 'medium',
  tags TEXT[],
  notes TEXT,

  -- Metadata
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TASKS
-- ============================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,

  -- Relationships
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Assignment
  assigned_to UUID REFERENCES team_members(id),
  assigned_by UUID REFERENCES team_members(id),

  -- Status
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOG / NOTES
-- ============================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What happened
  activity_type TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  outcome TEXT,

  -- Relationships
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Metadata
  logged_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_county_state ON properties(county, state);
CREATE INDEX idx_properties_assigned ON properties(assigned_to);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_assigned ON deals(assigned_to);
CREATE INDEX idx_deals_property ON deals(property_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activity_contact ON activity_log(contact_id);
CREATE INDEX idx_activity_deal ON activity_log(deal_id);
CREATE INDEX idx_activity_property ON activity_log(property_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- All authenticated team members can read/write everything
CREATE POLICY "Team members full access" ON team_members FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));
CREATE POLICY "Team members full access" ON contacts FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));
CREATE POLICY "Team members full access" ON properties FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));
CREATE POLICY "Team members full access" ON deals FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));
CREATE POLICY "Team members full access" ON tasks FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));
CREATE POLICY "Team members full access" ON activity_log FOR ALL USING (auth.uid() IN (SELECT id FROM team_members));

-- Allow new users to insert themselves during signup
CREATE POLICY "Users can insert own profile" ON team_members FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
