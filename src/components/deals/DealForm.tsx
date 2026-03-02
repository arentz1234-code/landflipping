'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Deal, DealStage, TaskPriority, TeamMember, Property, Contact } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { TagInput } from '@/components/ui/TagInput';
import { Card } from '@/components/ui/Card';
import { DEAL_STAGE_LABELS } from '@/lib/utils';
import toast from 'react-hot-toast';

const STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'offer_made', label: 'Offer Made' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
  { value: 'dead', label: 'Dead' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const DEAL_TYPE_OPTIONS = [
  { value: 'acquisition', label: 'Acquisition (Buying)' },
  { value: 'disposition', label: 'Disposition (Selling)' },
];

const FINANCING_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'seller_finance', label: 'Seller Finance' },
  { value: 'bank_loan', label: 'Bank Loan' },
];

interface DealFormProps {
  deal?: Deal;
  teamMembers: TeamMember[];
  properties: Property[];
  contacts: Contact[];
  currentUserId: string;
}

export function DealForm({ deal, teamMembers, properties, contacts, currentUserId }: DealFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: deal?.title || '',
    property_id: deal?.property_id || '',
    buyer_contact_id: deal?.buyer_contact_id || '',
    seller_contact_id: deal?.seller_contact_id || '',
    stage: deal?.stage || 'lead',
    deal_type: deal?.deal_type || 'acquisition',
    priority: deal?.priority || 'medium',
    offer_amount: deal?.offer_amount?.toString() || '',
    counter_offer_amount: deal?.counter_offer_amount?.toString() || '',
    agreed_price: deal?.agreed_price?.toString() || '',
    earnest_money: deal?.earnest_money?.toString() || '',
    due_diligence_fee: deal?.due_diligence_fee?.toString() || '',
    estimated_profit: deal?.estimated_profit?.toString() || '',
    commission: deal?.commission?.toString() || '',
    offer_date: deal?.offer_date || '',
    contract_date: deal?.contract_date || '',
    due_diligence_deadline: deal?.due_diligence_deadline || '',
    closing_date: deal?.closing_date || '',
    title_company: deal?.title_company || '',
    title_company_contact: deal?.title_company_contact || '',
    title_company_phone: deal?.title_company_phone || '',
    financing_type: deal?.financing_type || '',
    seller_finance_terms: deal?.seller_finance_terms || '',
    contingencies: deal?.contingencies || [],
    assigned_to: deal?.assigned_to || currentUserId,
    tags: deal?.tags || [],
    notes: deal?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      property_id: formData.property_id || null,
      buyer_contact_id: formData.buyer_contact_id || null,
      seller_contact_id: formData.seller_contact_id || null,
      stage: formData.stage,
      deal_type: formData.deal_type || null,
      priority: formData.priority,
      offer_amount: formData.offer_amount ? parseFloat(formData.offer_amount) : null,
      counter_offer_amount: formData.counter_offer_amount ? parseFloat(formData.counter_offer_amount) : null,
      agreed_price: formData.agreed_price ? parseFloat(formData.agreed_price) : null,
      earnest_money: formData.earnest_money ? parseFloat(formData.earnest_money) : null,
      due_diligence_fee: formData.due_diligence_fee ? parseFloat(formData.due_diligence_fee) : null,
      estimated_profit: formData.estimated_profit ? parseFloat(formData.estimated_profit) : null,
      commission: formData.commission ? parseFloat(formData.commission) : null,
      offer_date: formData.offer_date || null,
      contract_date: formData.contract_date || null,
      due_diligence_deadline: formData.due_diligence_deadline || null,
      closing_date: formData.closing_date || null,
      title_company: formData.title_company || null,
      title_company_contact: formData.title_company_contact || null,
      title_company_phone: formData.title_company_phone || null,
      financing_type: formData.financing_type || null,
      seller_finance_terms: formData.seller_finance_terms || null,
      contingencies: formData.contingencies.length > 0 ? formData.contingencies : null,
      assigned_to: formData.assigned_to || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      notes: formData.notes || null,
      created_by: deal ? undefined : currentUserId,
    };

    try {
      if (deal) {
        const { error } = await supabase.from('deals').update(payload).eq('id', deal.id);
        if (error) throw error;
        toast.success('Deal updated');
      } else {
        const { error } = await supabase.from('deals').insert(payload);
        if (error) throw error;
        toast.success('Deal created');
      }
      router.push('/deals');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const buyerContacts = contacts.filter(c => c.contact_type === 'buyer' || c.contact_type === 'builder');
  const sellerContacts = contacts.filter(c => c.contact_type === 'seller');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Deal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 10 acres Travis County - Builder X"
              required
            />
          </div>
          <Select
            label="Deal Type"
            value={formData.deal_type}
            onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
            options={DEAL_TYPE_OPTIONS}
          />
          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
            options={STAGE_OPTIONS}
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            options={PRIORITY_OPTIONS}
          />
          <Select
            label="Assigned To"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            options={teamMembers.map(m => ({ value: m.id, label: m.full_name }))}
            placeholder="Select team member"
          />
        </div>
      </Card>

      {/* Linked Entities */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Linked Property & Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Property"
            value={formData.property_id}
            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            options={properties.map(p => ({
              value: p.id,
              label: `${p.address || p.county + ', ' + p.state} (${p.acreage} ac)`,
            }))}
            placeholder="Select property"
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
        </div>
      </Card>

      {/* Financials */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Offer Amount ($)"
            type="number"
            step="0.01"
            value={formData.offer_amount}
            onChange={(e) => setFormData({ ...formData, offer_amount: e.target.value })}
          />
          <Input
            label="Counter Offer ($)"
            type="number"
            step="0.01"
            value={formData.counter_offer_amount}
            onChange={(e) => setFormData({ ...formData, counter_offer_amount: e.target.value })}
          />
          <Input
            label="Agreed Price ($)"
            type="number"
            step="0.01"
            value={formData.agreed_price}
            onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
          />
          <Input
            label="Earnest Money ($)"
            type="number"
            step="0.01"
            value={formData.earnest_money}
            onChange={(e) => setFormData({ ...formData, earnest_money: e.target.value })}
          />
          <Input
            label="Due Diligence Fee ($)"
            type="number"
            step="0.01"
            value={formData.due_diligence_fee}
            onChange={(e) => setFormData({ ...formData, due_diligence_fee: e.target.value })}
          />
          <Input
            label="Commission ($)"
            type="number"
            step="0.01"
            value={formData.commission}
            onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
          />
          <Input
            label="Estimated Profit ($)"
            type="number"
            step="0.01"
            value={formData.estimated_profit}
            onChange={(e) => setFormData({ ...formData, estimated_profit: e.target.value })}
          />
        </div>
      </Card>

      {/* Dates */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Dates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Offer Date"
            type="date"
            value={formData.offer_date}
            onChange={(e) => setFormData({ ...formData, offer_date: e.target.value })}
          />
          <Input
            label="Contract Date"
            type="date"
            value={formData.contract_date}
            onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
          />
          <Input
            label="DD Deadline"
            type="date"
            value={formData.due_diligence_deadline}
            onChange={(e) => setFormData({ ...formData, due_diligence_deadline: e.target.value })}
          />
          <Input
            label="Closing Date"
            type="date"
            value={formData.closing_date}
            onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
          />
        </div>
      </Card>

      {/* Title & Financing */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Title Company & Financing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Title Company"
            value={formData.title_company}
            onChange={(e) => setFormData({ ...formData, title_company: e.target.value })}
          />
          <Input
            label="Title Contact"
            value={formData.title_company_contact}
            onChange={(e) => setFormData({ ...formData, title_company_contact: e.target.value })}
          />
          <Input
            label="Title Phone"
            value={formData.title_company_phone}
            onChange={(e) => setFormData({ ...formData, title_company_phone: e.target.value })}
          />
          <Select
            label="Financing Type"
            value={formData.financing_type}
            onChange={(e) => setFormData({ ...formData, financing_type: e.target.value })}
            options={FINANCING_OPTIONS}
            placeholder="Select financing"
          />
          <div className="md:col-span-2">
            <Input
              label="Seller Finance Terms"
              value={formData.seller_finance_terms}
              onChange={(e) => setFormData({ ...formData, seller_finance_terms: e.target.value })}
              placeholder="e.g., 10% down, 9% interest, 5yr term"
            />
          </div>
        </div>
        <div className="mt-4">
          <TagInput
            label="Contingencies"
            value={formData.contingencies}
            onChange={(value) => setFormData({ ...formData, contingencies: value })}
            placeholder="Type contingency and press Enter"
          />
        </div>
      </Card>

      {/* Additional Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <TagInput
          label="Tags"
          value={formData.tags}
          onChange={(value) => setFormData({ ...formData, tags: value })}
          placeholder="Type tag and press Enter"
        />
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
          {deal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}
