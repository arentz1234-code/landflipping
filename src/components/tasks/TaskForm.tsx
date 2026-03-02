'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TeamMember, TaskPriority } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface TaskFormProps {
  dealId?: string;
  propertyId?: string;
  contactId?: string;
  teamMembers: TeamMember[];
  userId: string;
}

export function TaskForm({ dealId, propertyId, contactId, teamMembers, userId }: TaskFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as TaskPriority,
    due_date: '',
    assigned_to: userId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('tasks').insert({
        title: formData.title,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        assigned_by: userId,
        deal_id: dealId || null,
        property_id: propertyId || null,
        contact_id: contactId || null,
        status: 'todo',
      });

      if (error) throw error;

      toast.success('Task created');
      setFormData({ title: '', priority: 'medium', due_date: '', assigned_to: userId });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <Input
        label="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="What needs to be done?"
        required
      />
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          options={PRIORITY_OPTIONS}
        />
        <Input
          label="Due Date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
        <Select
          label="Assign To"
          value={formData.assigned_to}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          options={teamMembers.map(m => ({ value: m.id, label: m.full_name }))}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Task
        </Button>
      </div>
    </form>
  );
}
