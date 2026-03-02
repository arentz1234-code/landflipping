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

const isDevMode = () => typeof window !== 'undefined' && (
  process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL
);

interface BuyerFormProps {
  buyer?: any;
}

export function BuyerForm({ buyer }: BuyerFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!buyer;

  const [formData, setFormData] = useState({
    first_name: buyer?.first_name || '',
    last_name: buyer?.last_name || '',
    company_name: buyer?.company_name || '',
    email: buyer?.email || '',
    phone: buyer?.phone || '',
    city: buyer?.city || '',
    state: buyer?.state || '',
    counties_of_interest: buyer?.counties_of_interest || [],
    min_acreage: buyer?.min_acreage || '',
    max_acreage: buyer?.max_acreage || '',
    max_total_budget: buyer?.max_total_budget || '',
    financing_type: buyer?.financing_type || 'cash',
    notes: buyer?.notes || '',
    status: buyer?.status || 'active',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isDevMode()) {
      toast.success(isEditing ? 'Buyer updated!' : 'Buyer created!');
      router.push('/buyers');
      return;
    }

    try {
      const data = {
        ...formData,
        contact_type: 'buyer',
        min_acreage: formData.min_acreage ? parseFloat(formData.min_acreage as string) : null,
        max_acreage: formData.max_acreage ? parseFloat(formData.max_acreage as string) : null,
        max_total_budget: formData.max_total_budget ? parseFloat(formData.max_total_budget as string) : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', buyer.id);
        if (error) throw error;
        toast.success('Buyer updated!');
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert(data);
        if (error) throw error;
        toast.success('Buyer created!');
      }

      router.push('/buyers');
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Max Budget"
                type="number"
                value={formData.max_total_budget}
                onChange={(e) => setFormData({ ...formData, max_total_budget: e.target.value })}
              />
              <Select
                label="Financing Type"
                value={formData.financing_type}
                onChange={(e) => setFormData({ ...formData, financing_type: e.target.value })}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'conventional', label: 'Conventional Loan' },
                  { value: 'seller_finance', label: 'Seller Finance' },
                  { value: 'hard_money', label: 'Hard Money' },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <TextArea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Add any notes about this buyer..."
          />
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Buyer' : 'Create Buyer'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/buyers')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
