import { type DealStage, type PropertyStatus, type TaskPriority, type ContactType } from './types';

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  lead: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  offer_made: 'bg-yellow-100 text-yellow-800',
  negotiating: 'bg-orange-100 text-orange-800',
  under_contract: 'bg-purple-100 text-purple-800',
  due_diligence: 'bg-indigo-100 text-indigo-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
  dead: 'bg-gray-300 text-gray-600',
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  offer_made: 'Offer Made',
  negotiating: 'Negotiating',
  under_contract: 'Under Contract',
  due_diligence: 'Due Diligence',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  dead: 'Dead',
};

export const DEAL_STAGES: DealStage[] = [
  'lead',
  'contacted',
  'offer_made',
  'negotiating',
  'under_contract',
  'due_diligence',
  'closed_won',
  'closed_lost',
  'dead',
];

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, string> = {
  researching: 'bg-gray-100 text-gray-800',
  mailer_sent: 'bg-blue-100 text-blue-800',
  offer_sent: 'bg-yellow-100 text-yellow-800',
  under_contract: 'bg-purple-100 text-purple-800',
  owned: 'bg-green-100 text-green-800',
  listed_for_sale: 'bg-orange-100 text-orange-800',
  sold: 'bg-emerald-100 text-emerald-800',
  dead: 'bg-red-100 text-red-800',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  researching: 'Researching',
  mailer_sent: 'Mailer Sent',
  offer_sent: 'Offer Sent',
  under_contract: 'Under Contract',
  owned: 'Owned',
  listed_for_sale: 'Listed for Sale',
  sold: 'Sold',
  dead: 'Dead',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const CONTACT_TYPE_COLORS: Record<ContactType, string> = {
  buyer: 'bg-green-100 text-green-800',
  seller: 'bg-blue-100 text-blue-800',
  builder: 'bg-purple-100 text-purple-800',
  agent: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  builder: 'Builder',
  agent: 'Agent',
  other: 'Other',
};

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAcreage(acres: number | null): string {
  if (acres === null || acres === undefined) return '—';
  return `${acres.toLocaleString()} ac`;
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function contactFullName(contact: { first_name: string; last_name: string }): string {
  return `${contact.first_name} ${contact.last_name}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
