'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, List, X } from 'lucide-react';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'researching', label: 'Researching' },
  { value: 'mailer_sent', label: 'Mailer Sent' },
  { value: 'offer_sent', label: 'Offer Sent' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'owned', label: 'Owned' },
  { value: 'listed_for_sale', label: 'Listed for Sale' },
  { value: 'sold', label: 'Sold' },
  { value: 'dead', label: 'Dead' },
];

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [county, setCounty] = useState(searchParams.get('county') || '');
  const [state, setState] = useState(searchParams.get('state') || '');

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/properties?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (county) params.set('county', county);
    else params.delete('county');
    if (state) params.set('state', state);
    else params.delete('state');
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setCounty('');
    setState('');
    router.push('/properties');
  };

  const toggleView = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentView = params.get('view');
    if (currentView === 'table') {
      params.delete('view');
    } else {
      params.set('view', 'table');
    }
    router.push(`/properties?${params.toString()}`);
  };

  const hasFilters = searchParams.get('status') || searchParams.get('county') || searchParams.get('state');
  const isTableView = searchParams.get('view') === 'table';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-40">
          <Select
            value={searchParams.get('status') || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="w-32">
          <Input
            placeholder="County"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="w-20">
          <Input
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            maxLength={2}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
        <div className="ml-auto">
          <Button variant="ghost" onClick={toggleView}>
            {isTableView ? (
              <LayoutGrid className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
