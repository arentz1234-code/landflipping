'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'note', label: 'Note' },
  { value: 'mailer_sent', label: 'Mailer Sent' },
];

const OUTCOME_OPTIONS = [
  { value: '', label: 'Select outcome' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'follow_up_needed', label: 'Follow Up Needed' },
];

interface ActivityFormProps {
  contactId?: string;
  dealId?: string;
  propertyId?: string;
  userId: string;
}

export function ActivityForm({ contactId, dealId, propertyId, userId }: ActivityFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'call',
    subject: '',
    body: '',
    outcome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('activity_log').insert({
        activity_type: formData.activity_type,
        subject: formData.subject || null,
        body: formData.body || null,
        outcome: formData.outcome || null,
        contact_id: contactId || null,
        deal_id: dealId || null,
        property_id: propertyId || null,
        logged_by: userId,
      });

      if (error) throw error;

      // Update last_contacted_at if this is a contact activity
      if (contactId) {
        await supabase
          .from('contacts')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', contactId);
      }

      toast.success('Activity logged');
      setFormData({ activity_type: 'call', subject: '', body: '', outcome: '' });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Log Activity
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Activity Type"
          value={formData.activity_type}
          onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
          options={ACTIVITY_TYPES}
        />
        <Select
          label="Outcome"
          value={formData.outcome}
          onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
          options={OUTCOME_OPTIONS}
        />
      </div>
      <Input
        label="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        placeholder="Brief summary"
      />
      <TextArea
        label="Details"
        value={formData.body}
        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        rows={3}
        placeholder="Full notes..."
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Log Activity
        </Button>
      </div>
    </form>
  );
}
