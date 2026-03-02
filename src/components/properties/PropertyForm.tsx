'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Property, PropertyStatus, TeamMember, Contact } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { TagInput } from '@/components/ui/TagInput';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'researching', label: 'Researching' },
  { value: 'mailer_sent', label: 'Mailer Sent' },
  { value: 'offer_sent', label: 'Offer Sent' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'owned', label: 'Owned' },
  { value: 'listed_for_sale', label: 'Listed for Sale' },
  { value: 'sold', label: 'Sold' },
  { value: 'dead', label: 'Dead' },
];

const ZONING_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'mixed', label: 'Mixed Use' },
];

const TERRAIN_OPTIONS = [
  { value: 'flat', label: 'Flat' },
  { value: 'wooded', label: 'Wooded' },
  { value: 'hilly', label: 'Hilly' },
  { value: 'cleared', label: 'Cleared' },
  { value: 'wetland', label: 'Wetland' },
];

const ROAD_TYPE_OPTIONS = [
  { value: 'paved', label: 'Paved' },
  { value: 'dirt', label: 'Dirt' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'no_access', label: 'No Access' },
];

const WATER_SOURCE_OPTIONS = [
  { value: 'city', label: 'City Water' },
  { value: 'well', label: 'Well' },
  { value: 'none', label: 'None' },
];

const UTILITY_OPTIONS = ['electric', 'water', 'sewer', 'gas', 'internet'];

interface PropertyFormProps {
  property?: Property;
  teamMembers: TeamMember[];
  contacts: Contact[];
  currentUserId: string;
}

export function PropertyForm({ property, teamMembers, contacts, currentUserId }: PropertyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    apn: property?.apn || '',
    address: property?.address || '',
    county: property?.county || '',
    state: property?.state || '',
    zip: property?.zip || '',
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
    legal_description: property?.legal_description || '',
    acreage: property?.acreage?.toString() || '',
    zoning: property?.zoning || '',
    terrain: property?.terrain || '',
    road_access: property?.road_access || false,
    road_type: property?.road_type || '',
    utilities_available: property?.utilities_available || [],
    water_source: property?.water_source || '',
    flood_zone: property?.flood_zone || '',
    hoa: property?.hoa || false,
    hoa_fee: property?.hoa_fee?.toString() || '',
    restrictions: property?.restrictions || '',
    mineral_rights: property?.mineral_rights ?? true,
    easements: property?.easements || '',
    market_value: property?.market_value?.toString() || '',
    tax_assessed_value: property?.tax_assessed_value?.toString() || '',
    annual_taxes: property?.annual_taxes?.toString() || '',
    purchase_price: property?.purchase_price?.toString() || '',
    asking_price: property?.asking_price?.toString() || '',
    closing_costs: property?.closing_costs?.toString() || '',
    acquisition_date: property?.acquisition_date || '',
    listed_date: property?.listed_date || '',
    status: property?.status || 'researching',
    seller_contact_id: property?.seller_contact_id || '',
    buyer_contact_id: property?.buyer_contact_id || '',
    assigned_to: property?.assigned_to || currentUserId,
    tags: property?.tags || [],
    notes: property?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const acreage = parseFloat(formData.acreage);
    const purchasePrice = formData.purchase_price ? parseFloat(formData.purchase_price) : null;
    const askingPrice = formData.asking_price ? parseFloat(formData.asking_price) : null;

    const payload = {
      apn: formData.apn || null,
      address: formData.address || null,
      county: formData.county,
      state: formData.state,
      zip: formData.zip || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      legal_description: formData.legal_description || null,
      acreage,
      zoning: formData.zoning || null,
      terrain: formData.terrain || null,
      road_access: formData.road_access,
      road_type: formData.road_type || null,
      utilities_available: formData.utilities_available.length > 0 ? formData.utilities_available : null,
      water_source: formData.water_source || null,
      flood_zone: formData.flood_zone || null,
      hoa: formData.hoa,
      hoa_fee: formData.hoa_fee ? parseFloat(formData.hoa_fee) : null,
      restrictions: formData.restrictions || null,
      mineral_rights: formData.mineral_rights,
      easements: formData.easements || null,
      market_value: formData.market_value ? parseFloat(formData.market_value) : null,
      tax_assessed_value: formData.tax_assessed_value ? parseFloat(formData.tax_assessed_value) : null,
      annual_taxes: formData.annual_taxes ? parseFloat(formData.annual_taxes) : null,
      purchase_price: purchasePrice,
      purchase_price_per_acre: purchasePrice && acreage ? purchasePrice / acreage : null,
      asking_price: askingPrice,
      asking_price_per_acre: askingPrice && acreage ? askingPrice / acreage : null,
      closing_costs: formData.closing_costs ? parseFloat(formData.closing_costs) : null,
      acquisition_date: formData.acquisition_date || null,
      listed_date: formData.listed_date || null,
      status: formData.status,
      seller_contact_id: formData.seller_contact_id || null,
      buyer_contact_id: formData.buyer_contact_id || null,
      assigned_to: formData.assigned_to || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      notes: formData.notes || null,
      created_by: property ? undefined : currentUserId,
    };

    try {
      if (property) {
        const { error } = await supabase.from('properties').update(payload).eq('id', property.id);
        if (error) throw error;
        toast.success('Property updated');
      } else {
        const { error } = await supabase.from('properties').insert(payload);
        if (error) throw error;
        toast.success('Property created');
      }
      router.push('/properties');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUtilityChange = (utility: string) => {
    const current = formData.utilities_available;
    if (current.includes(utility)) {
      setFormData({ ...formData, utilities_available: current.filter(u => u !== utility) });
    } else {
      setFormData({ ...formData, utilities_available: [...current, utility] });
    }
  };

  const sellerContacts = contacts.filter(c => c.contact_type === 'seller');
  const buyerContacts = contacts.filter(c => c.contact_type === 'buyer' || c.contact_type === 'builder');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="APN (Assessor Parcel Number)"
            value={formData.apn}
            onChange={(e) => setFormData({ ...formData, apn: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="County"
            value={formData.county}
            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
            required
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
          <Input
            label="ZIP Code"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Legal Description"
              value={formData.legal_description}
              onChange={(e) => setFormData({ ...formData, legal_description: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Land Details */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Land Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Acreage"
            type="number"
            step="0.01"
            value={formData.acreage}
            onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
            required
          />
          <Select
            label="Zoning"
            value={formData.zoning}
            onChange={(e) => setFormData({ ...formData, zoning: e.target.value })}
            options={ZONING_OPTIONS}
            placeholder="Select zoning"
          />
          <Select
            label="Terrain"
            value={formData.terrain}
            onChange={(e) => setFormData({ ...formData, terrain: e.target.value })}
            options={TERRAIN_OPTIONS}
            placeholder="Select terrain"
          />
          <div className="flex items-end">
            <Toggle
              label="Road Access"
              checked={formData.road_access}
              onChange={(checked) => setFormData({ ...formData, road_access: checked })}
            />
          </div>
          <Select
            label="Road Type"
            value={formData.road_type}
            onChange={(e) => setFormData({ ...formData, road_type: e.target.value })}
            options={ROAD_TYPE_OPTIONS}
            placeholder="Select road type"
          />
          <Select
            label="Water Source"
            value={formData.water_source}
            onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
            options={WATER_SOURCE_OPTIONS}
            placeholder="Select water source"
          />
          <Input
            label="Flood Zone"
            value={formData.flood_zone}
            onChange={(e) => setFormData({ ...formData, flood_zone: e.target.value })}
            placeholder="e.g., X, A, AE"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Utilities Available</label>
          <div className="flex flex-wrap gap-4">
            {UTILITY_OPTIONS.map((utility) => (
              <label key={utility} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.utilities_available.includes(utility)}
                  onChange={() => handleUtilityChange(utility)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">{utility}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <Toggle
            label="HOA"
            checked={formData.hoa}
            onChange={(checked) => setFormData({ ...formData, hoa: checked })}
          />
          <Toggle
            label="Mineral Rights Included"
            checked={formData.mineral_rights}
            onChange={(checked) => setFormData({ ...formData, mineral_rights: checked })}
          />
        </div>

        {formData.hoa && (
          <div className="mt-4">
            <Input
              label="HOA Fee (Annual)"
              type="number"
              step="0.01"
              value={formData.hoa_fee}
              onChange={(e) => setFormData({ ...formData, hoa_fee: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextArea
            label="Deed Restrictions"
            value={formData.restrictions}
            onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
            rows={2}
          />
          <TextArea
            label="Easements"
            value={formData.easements}
            onChange={(e) => setFormData({ ...formData, easements: e.target.value })}
            rows={2}
          />
        </div>
      </Card>

      {/* Financials */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Market Value ($)"
            type="number"
            step="0.01"
            value={formData.market_value}
            onChange={(e) => setFormData({ ...formData, market_value: e.target.value })}
          />
          <Input
            label="Tax Assessed Value ($)"
            type="number"
            step="0.01"
            value={formData.tax_assessed_value}
            onChange={(e) => setFormData({ ...formData, tax_assessed_value: e.target.value })}
          />
          <Input
            label="Annual Taxes ($)"
            type="number"
            step="0.01"
            value={formData.annual_taxes}
            onChange={(e) => setFormData({ ...formData, annual_taxes: e.target.value })}
          />
          <Input
            label="Purchase Price ($)"
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
          />
          <Input
            label="Asking Price ($)"
            type="number"
            step="0.01"
            value={formData.asking_price}
            onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
          />
          <Input
            label="Closing Costs ($)"
            type="number"
            step="0.01"
            value={formData.closing_costs}
            onChange={(e) => setFormData({ ...formData, closing_costs: e.target.value })}
          />
        </div>
      </Card>

      {/* Dates & Status */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
            options={STATUS_OPTIONS}
          />
          <Input
            label="Acquisition Date"
            type="date"
            value={formData.acquisition_date}
            onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
          />
          <Input
            label="Listed Date"
            type="date"
            value={formData.listed_date}
            onChange={(e) => setFormData({ ...formData, listed_date: e.target.value })}
          />
          <Select
            label="Seller Contact"
            value={formData.seller_contact_id}
            onChange={(e) => setFormData({ ...formData, seller_contact_id: e.target.value })}
            options={sellerContacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))}
            placeholder="Select seller"
          />
          <Select
            label="Buyer Contact"
            value={formData.buyer_contact_id}
            onChange={(e) => setFormData({ ...formData, buyer_contact_id: e.target.value })}
            options={buyerContacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))}
            placeholder="Select buyer"
          />
          <Select
            label="Assigned To"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            options={teamMembers.map(m => ({ value: m.id, label: m.full_name }))}
            placeholder="Select team member"
          />
        </div>
        <div className="mt-4">
          <TagInput
            label="Tags"
            value={formData.tags}
            onChange={(value) => setFormData({ ...formData, tags: value })}
            placeholder="Type tag and press Enter"
          />
        </div>
        <div className="mt-4">
          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />
        </div>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {property ? 'Update Property' : 'Create Property'}
        </Button>
      </div>
    </form>
  );
}
