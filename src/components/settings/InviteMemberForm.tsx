'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { UserRole } from '@/lib/types';
import toast from 'react-hot-toast';

export function InviteMemberForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('member');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists as team member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingMember) {
        throw new Error('This email is already a team member');
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingInvite) {
        // Update existing invitation
        const { error } = await supabase
          .from('invitations')
          .update({ role })
          .eq('email', email.toLowerCase());

        if (error) throw error;
        toast.success(`Updated invitation for ${email} as ${role}`);
      } else {
        // Create new invitation
        const { error } = await supabase
          .from('invitations')
          .insert({
            email: email.toLowerCase(),
            role,
          });

        if (error) throw error;
        toast.success(`Invited ${email} as ${role}. They can now sign up.`);
      }

      setEmail('');
      setName('');
      setRole('member');
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Invite Member
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin - Full access, can manage team</option>
              <option value="member">Member - Can create and edit data</option>
              <option value="viewer">Viewer - Read-only access</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            The invited user can sign up with this email and will automatically get the selected role.
          </p>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
