'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';
import toast from 'react-hot-toast';

interface MemberRoleSelectProps {
  memberId: string;
  currentRole: UserRole;
}

export function MemberRoleSelect({ memberId, currentRole }: MemberRoleSelectProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === currentRole) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Role updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
      disabled={loading}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="admin">Admin</option>
      <option value="member">Member</option>
      <option value="viewer">Viewer</option>
    </select>
  );
}
