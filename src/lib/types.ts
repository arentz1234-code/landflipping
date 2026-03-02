export type DealStage =
  | 'lead'
  | 'contacted'
  | 'offer_made'
  | 'negotiating'
  | 'under_contract'
  | 'due_diligence'
  | 'closed_won'
  | 'closed_lost'
  | 'dead';

export type ContactType = 'buyer' | 'seller' | 'builder' | 'agent' | 'other';

export type PropertyStatus =
  | 'researching'
  | 'mailer_sent'
  | 'offer_sent'
  | 'under_contract'
  | 'owned'
  | 'listed_for_sale'
  | 'sold'
  | 'dead';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type UserRole = 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  contact_type: ContactType;
  first_name: string;
  last_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  mailing_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  counties_of_interest: string[] | null;
  states_of_interest: string[] | null;
  min_acreage: number | null;
  max_acreage: number | null;
  min_price_per_acre: number | null;
  max_price_per_acre: number | null;
  max_total_budget: number | null;
  preferred_zoning: string[] | null;
  needs_road_access: boolean;
  needs_utilities: boolean;
  needs_water: boolean;
  preferred_terrain: string[] | null;
  builder_type: string | null;
  avg_homes_per_year: number | null;
  preferred_lot_size: string | null;
  motivation_level: number | null;
  asking_price: number | null;
  reason_for_selling: string | null;
  source: string | null;
  status: string;
  last_contacted_at: string | null;
  assigned_to: string | null;
  tags: string[] | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  apn: string | null;
  address: string | null;
  county: string;
  state: string;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  legal_description: string | null;
  acreage: number;
  zoning: string | null;
  terrain: string | null;
  road_access: boolean;
  road_type: string | null;
  utilities_available: string[] | null;
  water_source: string | null;
  flood_zone: string | null;
  hoa: boolean;
  hoa_fee: number | null;
  restrictions: string | null;
  mineral_rights: boolean;
  easements: string | null;
  market_value: number | null;
  tax_assessed_value: number | null;
  annual_taxes: number | null;
  purchase_price: number | null;
  purchase_price_per_acre: number | null;
  asking_price: number | null;
  asking_price_per_acre: number | null;
  sold_price: number | null;
  closing_costs: number | null;
  profit: number | null;
  acquisition_date: string | null;
  listed_date: string | null;
  sold_date: string | null;
  status: PropertyStatus;
  seller_contact_id: string | null;
  buyer_contact_id: string | null;
  assigned_to: string | null;
  tags: string[] | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  property_id: string | null;
  buyer_contact_id: string | null;
  seller_contact_id: string | null;
  stage: DealStage;
  deal_type: string | null;
  offer_amount: number | null;
  counter_offer_amount: number | null;
  agreed_price: number | null;
  earnest_money: number | null;
  due_diligence_fee: number | null;
  estimated_profit: number | null;
  commission: number | null;
  offer_date: string | null;
  contract_date: string | null;
  due_diligence_deadline: string | null;
  closing_date: string | null;
  actual_close_date: string | null;
  title_company: string | null;
  title_company_contact: string | null;
  title_company_phone: string | null;
  financing_type: string | null;
  seller_finance_terms: string | null;
  contingencies: string[] | null;
  assigned_to: string | null;
  priority: TaskPriority;
  tags: string[] | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  property?: Property;
  buyer_contact?: Contact;
  seller_contact?: Contact;
  assigned_member?: TeamMember;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deal_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  deal?: Deal;
  property?: Property;
  contact?: Contact;
  assigned_member?: TeamMember;
}

export interface ActivityLog {
  id: string;
  activity_type: string;
  subject: string | null;
  body: string | null;
  outcome: string | null;
  deal_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  logged_by: string | null;
  created_at: string;
  // Joined fields
  logged_by_member?: TeamMember;
}
