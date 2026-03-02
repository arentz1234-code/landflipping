'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CancelInviteButtonProps {
  inviteId: string;
  email: string;
}

export function CancelInviteButton({ inviteId, email }: CancelInviteButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm(`Cancel invitation for ${email}?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      toast.success('Invitation cancelled');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className="text-red-600 hover:bg-red-50"
    >
      <X className="w-4 h-4" />
    </Button>
  );
}
