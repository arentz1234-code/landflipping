'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Contact, ContactType, TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Toggle } from '@/components/ui/Toggle';
import { TagInput } from '@/components/ui/TagInput';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'builder', label: 'Builder' },
  { value: 'agent', label: 'Agent' },
  { value: 'other', label: 'Other' },
];

const SOURCE_OPTIONS = [
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'referral', label: 'Referral' },
  { value: 'mailer', label: 'Mailer Response' },
  { value: 'website', label: 'Website' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

const ZONING_OPTIONS = ['residential', 'commercial', 'agricultural', 'mixed'];
const TERRAIN_OPTIONS = ['flat', 'wooded', 'hilly', 'cleared'];
const BUILDER_TYPE_OPTIONS = [
  { value: 'custom_homes', label: 'Custom Homes' },
  { value: 'spec_homes', label: 'Spec Homes' },
  { value: 'subdivisions', label: 'Subdivisions' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed-Use' },
];

interface ContactFormProps {
  contact?: Contact;
  teamMembers: TeamMember[];
  currentUserId: string;
}

export function ContactForm({ contact, teamMembers, currentUserId }: ContactFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    contact_type: contact?.contact_type || 'buyer',
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    company_name: contact?.company_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    phone_secondary: contact?.phone_secondary || '',
    mailing_address: contact?.mailing_address || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zip: contact?.zip || '',
    source: contact?.source || '',
    status: contact?.status || 'active',
    assigned_to: contact?.assigned_to || currentUserId,
    tags: contact?.tags || [],
    notes: contact?.notes || '',
    // Buyer/Builder fields
    counties_of_interest: contact?.counties_of_interest || [],
    states_of_interest: contact?.states_of_interest || [],
    min_acreage: contact?.min_acreage?.toString() || '',
    max_acreage: contact?.max_acreage?.toString() || '',
    min_price_per_acre: contact?.min_price_per_acre?.toString() || '',
    max_price_per_acre: contact?.max_price_per_acre?.toString() || '',
    max_total_budget: contact?.max_total_budget?.toString() || '',
    preferred_zoning: contact?.preferred_zoning || [],
    needs_road_access: contact?.needs_road_access || false,
    needs_utilities: contact?.needs_utilities || false,
    needs_water: contact?.needs_water || false,
    preferred_terrain: contact?.preferred_terrain || [],
    // Builder-specific
    builder_type: contact?.builder_type || '',
    avg_homes_per_year: contact?.avg_homes_per_year?.toString() || '',
    preferred_lot_size: contact?.preferred_lot_size || '',
    // Seller-specific
    motivation_level: contact?.motivation_level?.toString() || '',
    asking_price: contact?.asking_price?.toString() || '',
    reason_for_selling: contact?.reason_for_selling || '',
  });

  const isBuyerOrBuilder = formData.contact_type === 'buyer' || formData.contact_type === 'builder';
  const isBuilder = formData.contact_type === 'builder';
  const isSeller = formData.contact_type === 'seller';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      contact_type: formData.contact_type,
      first_name: formData.first_name,
      last_name: formData.last_name,
      company_name: formData.company_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      phone_secondary: formData.phone_secondary || null,
      mailing_address: formData.mailing_address || null,
      city: formData.city || null,
      state: formData.state || null,
      zip: formData.zip || null,
      source: formData.source || null,
      status: formData.status,
      assigned_to: formData.assigned_to || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      notes: formData.notes || null,
      // Buyer/Builder fields
      counties_of_interest: isBuyerOrBuilder && formData.counties_of_interest.length > 0 ? formData.counties_of_interest : null,
      states_of_interest: isBuyerOrBuilder && formData.states_of_interest.length > 0 ? formData.states_of_interest : null,
      min_acreage: isBuyerOrBuilder && formData.min_acreage ? parseFloat(formData.min_acreage) : null,
      max_acreage: isBuyerOrBuilder && formData.max_acreage ? parseFloat(formData.max_acreage) : null,
      min_price_per_acre: isBuyerOrBuilder && formData.min_price_per_acre ? parseFloat(formData.min_price_per_acre) : null,
      max_price_per_acre: isBuyerOrBuilder && formData.max_price_per_acre ? parseFloat(formData.max_price_per_acre) : null,
      max_total_budget: isBuyerOrBuilder && formData.max_total_budget ? parseFloat(formData.max_total_budget) : null,
      preferred_zoning: isBuyerOrBuilder && formData.preferred_zoning.length > 0 ? formData.preferred_zoning : null,
      needs_road_access: isBuyerOrBuilder ? formData.needs_road_access : false,
      needs_utilities: isBuyerOrBuilder ? formData.needs_utilities : false,
      needs_water: isBuyerOrBuilder ? formData.needs_water : false,
      preferred_terrain: isBuyerOrBuilder && formData.preferred_terrain.length > 0 ? formData.preferred_terrain : null,
      // Builder-specific
      builder_type: isBuilder ? formData.builder_type || null : null,
      avg_homes_per_year: isBuilder && formData.avg_homes_per_year ? parseInt(formData.avg_homes_per_year) : null,
      preferred_lot_size: isBuilder ? formData.preferred_lot_size || null : null,
      // Seller-specific
      motivation_level: isSeller && formData.motivation_level ? parseInt(formData.motivation_level) : null,
      asking_price: isSeller && formData.asking_price ? parseFloat(formData.asking_price) : null,
      reason_for_selling: isSeller ? formData.reason_for_selling || null : null,
      // Metadata
      created_by: contact ? undefined : currentUserId,
    };

    try {
      if (contact) {
        const { error } = await supabase
          .from('contacts')
          .update(payload)
          .eq('id', contact.id);
        if (error) throw error;
        toast.success('Contact updated');
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(payload);
        if (error) throw error;
        toast.success('Contact created');
      }
      router.push('/contacts');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: 'preferred_zoning' | 'preferred_terrain', value: string) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Type */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Type</h2>
        <Select
          label="Type"
          value={formData.contact_type}
          onChange={(e) => setFormData({ ...formData, contact_type: e.target.value as ContactType })}
          options={CONTACT_TYPES}
        />
      </Card>

      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <Input
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Secondary Phone"
            value={formData.phone_secondary}
            onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
          />
        </div>
      </Card>

      {/* Address */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mailing Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              value={formData.mailing_address}
              onChange={(e) => setFormData({ ...formData, mailing_address: e.target.value })}
            />
          </div>
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="ZIP"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Buyer/Builder Criteria */}
      {isBuyerOrBuilder && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buying Criteria</h2>
          <div className="space-y-4">
            <TagInput
              label="Counties of Interest"
              value={formData.counties_of_interest}
              onChange={(value) => setFormData({ ...formData, counties_of_interest: value })}
              placeholder="Type county name and press Enter"
            />
            <TagInput
              label="States of Interest"
              value={formData.states_of_interest}
              onChange={(value) => setFormData({ ...formData, states_of_interest: value })}
              placeholder="Type state abbreviation and press Enter (e.g., TX, FL)"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min Acreage"
                type="number"
                step="0.01"
                value={formData.min_acreage}
                onChange={(e) => setFormData({ ...formData, min_acreage: e.target.value })}
              />
              <Input
                label="Max Acreage"
                type="number"
                step="0.01"
                value={formData.max_acreage}
                onChange={(e) => setFormData({ ...formData, max_acreage: e.target.value })}
              />
              <Input
                label="Min Price per Acre ($)"
                type="number"
                step="0.01"
                value={formData.min_price_per_acre}
                onChange={(e) => setFormData({ ...formData, min_price_per_acre: e.target.value })}
              />
              <Input
                label="Max Price per Acre ($)"
                type="number"
                step="0.01"
                value={formData.max_price_per_acre}
                onChange={(e) => setFormData({ ...formData, max_price_per_acre: e.target.value })}
              />
              <Input
                label="Max Total Budget ($)"
                type="number"
                step="0.01"
                value={formData.max_total_budget}
                onChange={(e) => setFormData({ ...formData, max_total_budget: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Zoning</label>
              <div className="flex flex-wrap gap-4">
                {ZONING_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferred_zoning.includes(option)}
                      onChange={() => handleCheckboxChange('preferred_zoning', option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Toggle
                label="Needs Road Access"
                checked={formData.needs_road_access}
                onChange={(checked) => setFormData({ ...formData, needs_road_access: checked })}
              />
              <Toggle
                label="Needs Utilities"
                checked={formData.needs_utilities}
                onChange={(checked) => setFormData({ ...formData, needs_utilities: checked })}
              />
              <Toggle
                label="Needs Water"
                checked={formData.needs_water}
                onChange={(checked) => setFormData({ ...formData, needs_water: checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Terrain</label>
              <div className="flex flex-wrap gap-4">
                {TERRAIN_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferred_terrain.includes(option)}
                      onChange={() => handleCheckboxChange('preferred_terrain', option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Builder-specific */}
      {isBuilder && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Builder Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Builder Type"
              value={formData.builder_type}
              onChange={(e) => setFormData({ ...formData, builder_type: e.target.value })}
              options={BUILDER_TYPE_OPTIONS}
              placeholder="Select builder type"
            />
            <Input
              label="Avg Homes per Year"
              type="number"
              value={formData.avg_homes_per_year}
              onChange={(e) => setFormData({ ...formData, avg_homes_per_year: e.target.value })}
            />
            <Input
              label="Preferred Lot Size"
              value={formData.preferred_lot_size}
              onChange={(e) => setFormData({ ...formData, preferred_lot_size: e.target.value })}
              placeholder="e.g., 0.25-0.5 acres"
            />
          </div>
        </Card>
      )}

      {/* Seller-specific */}
      {isSeller && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Motivation Level (1-10)"
              type="number"
              min="1"
              max="10"
              value={formData.motivation_level}
              onChange={(e) => setFormData({ ...formData, motivation_level: e.target.value })}
            />
            <Input
              label="Asking Price ($)"
              type="number"
              step="0.01"
              value={formData.asking_price}
              onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
            />
            <div className="md:col-span-2">
              <TextArea
                label="Reason for Selling"
                value={formData.reason_for_selling}
                onChange={(e) => setFormData({ ...formData, reason_for_selling: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tracking */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            options={SOURCE_OPTIONS}
            placeholder="Select source"
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={STATUS_OPTIONS}
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {contact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
