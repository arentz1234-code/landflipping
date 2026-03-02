'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RemoveMemberButtonProps {
  memberId: string;
  memberName: string;
}

export function RemoveMemberButton({ memberId, memberName }: RemoveMemberButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
      toast.success('Team member removed');
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Remove Team Member">
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove <strong>{memberName}</strong> from the team?
          They will lose access to all CRM data.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemove} loading={loading}>
            Remove Member
          </Button>
        </div>
      </Modal>
    </>
  );
}
