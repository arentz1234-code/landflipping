'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/ui/TagInput';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface BuilderFormProps {
  builder?: any;
}

export function BuilderForm({ builder }: BuilderFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!builder;

  const [formData, setFormData] = useState({
    first_name: builder?.first_name || '',
    last_name: builder?.last_name || '',
    company_name: builder?.company_name || '',
    email: builder?.email || '',
    phone: builder?.phone || '',
    city: builder?.city || '',
    state: builder?.state || '',
    counties_of_interest: builder?.counties_of_interest || [],
    min_acreage: builder?.min_acreage || '',
    max_acreage: builder?.max_acreage || '',
    max_total_budget: builder?.max_total_budget || '',
    builder_type: builder?.builder_type || 'custom',
    avg_homes_per_year: builder?.avg_homes_per_year || '',
    preferred_lot_size: builder?.preferred_lot_size || '',
    notes: builder?.notes || '',
    status: builder?.status || 'active',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        contact_type: 'builder',
        min_acreage: formData.min_acreage ? parseFloat(formData.min_acreage as string) : null,
        max_acreage: formData.max_acreage ? parseFloat(formData.max_acreage as string) : null,
        max_total_budget: formData.max_total_budget ? parseFloat(formData.max_total_budget as string) : null,
        avg_homes_per_year: formData.avg_homes_per_year ? parseInt(formData.avg_homes_per_year as string) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', builder.id);
        if (error) throw error;
        toast.success('Builder updated!');
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(data);
        if (error) throw error;
        toast.success('Builder created!');
      }

      router.push('/builders');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-2xl space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
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
              required
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
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Builder Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Builder Type"
              value={formData.builder_type}
              onChange={(e) => setFormData({ ...formData, builder_type: e.target.value })}
              options={[
                { value: 'custom', label: 'Custom Home Builder' },
                { value: 'production', label: 'Production Builder' },
                { value: 'spec', label: 'Spec Builder' },
                { value: 'infill', label: 'Infill Developer' },
              ]}
            />
            <Input
              label="Avg Homes Per Year"
              type="number"
              value={formData.avg_homes_per_year}
              onChange={(e) => setFormData({ ...formData, avg_homes_per_year: e.target.value })}
            />
            <Input
              label="Preferred Lot Size"
              value={formData.preferred_lot_size}
              onChange={(e) => setFormData({ ...formData, preferred_lot_size: e.target.value })}
              placeholder="e.g., 0.5 acres"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buying Criteria</h2>
          <div className="space-y-4">
            <TagInput
              label="Counties of Interest"
              value={formData.counties_of_interest}
              onChange={(tags) => setFormData({ ...formData, counties_of_interest: tags })}
              placeholder="Type county name and press Enter"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min Lot Size (acres)"
                type="number"
                step="0.01"
                value={formData.min_acreage}
                onChange={(e) => setFormData({ ...formData, min_acreage: e.target.value })}
              />
              <Input
                label="Max Lot Size (acres)"
                type="number"
                step="0.01"
                value={formData.max_acreage}
                onChange={(e) => setFormData({ ...formData, max_acreage: e.target.value })}
              />
            </div>
            <Input
              label="Max Budget Per Lot"
              type="number"
              value={formData.max_total_budget}
              onChange={(e) => setFormData({ ...formData, max_total_budget: e.target.value })}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <TextArea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Add any notes about this builder..."
          />
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Builder' : 'Create Builder'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/builders')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
