'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

const CONTACT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'builder', label: 'Builder' },
  { value: 'agent', label: 'Agent' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

interface ContactFiltersProps {
  teamMembers: { id: string; full_name: string }[];
}

export function ContactFilters({ teamMembers }: ContactFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/contacts?${params.toString()}`);
  };

  const handleSearch = () => {
    updateFilter('search', search);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/contacts');
  };

  const hasFilters = searchParams.toString() !== '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="secondary">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="w-40">
          <Select
            value={searchParams.get('type') || ''}
            onChange={(e) => updateFilter('type', e.target.value)}
            options={CONTACT_TYPE_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            value={searchParams.get('status') || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="w-48">
          <Select
            value={searchParams.get('assigned_to') || ''}
            onChange={(e) => updateFilter('assigned_to', e.target.value)}
            options={[
              { value: '', label: 'All Team Members' },
              ...teamMembers.map((m) => ({ value: m.id, label: m.full_name })),
            ]}
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
