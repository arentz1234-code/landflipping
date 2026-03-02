'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteContactButtonProps {
  contactId: string;
}

export function DeleteContactButton({ contactId }: DeleteContactButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contactId);
      if (error) throw error;
      toast.success('Contact deleted');
      router.push('/contacts');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Contact">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this contact? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Contact
          </Button>
        </div>
      </Modal>
    </>
  );
}
