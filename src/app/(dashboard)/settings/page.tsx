import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { InviteMemberForm } from '@/components/settings/InviteMemberForm';
import { MemberRoleSelect } from '@/components/settings/MemberRoleSelect';
import { RemoveMemberButton } from '@/components/settings/RemoveMemberButton';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockCurrentMember = {
  id: 'demo-user',
  full_name: 'Demo User',
  email: 'demo@example.com',
  role: 'admin',
  created_at: new Date().toISOString(),
};

const mockTeamMembers = [
  { id: 'demo-user', full_name: 'Demo User', email: 'demo@example.com', role: 'admin', created_at: new Date().toISOString() },
  { id: 'member-2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'member', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
];

export default async function SettingsPage() {
  let currentMember: any = null;
  let teamMembers: any[] = [];
  let userId = 'demo-user';

  if (isDevMode()) {
    currentMember = mockCurrentMember;
    teamMembers = mockTeamMembers;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    }

    const { data: cm } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: tm } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });

    currentMember = cm;
    teamMembers = tm || [];
  }

  const isAdmin = currentMember?.role === 'admin';

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    member: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <Header title="Settings" subtitle="Manage your team" />

      <div className="max-w-4xl space-y-6">
        {/* Team Members */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-500">{teamMembers?.length || 0} members</p>
            </div>
            {isAdmin && <InviteMemberForm />}
          </div>

          <div className="divide-y divide-gray-200">
            {teamMembers?.map((member) => (
              <div key={member.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.full_name}
                      {member.id === userId && (
                        <span className="text-xs text-gray-500 ml-2">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Joined {formatDate(member.created_at)}
                  </p>

                  {isAdmin && member.id !== userId ? (
                    <div className="flex items-center gap-2">
                      <MemberRoleSelect
                        memberId={member.id}
                        currentRole={member.role}
                      />
                      <RemoveMemberButton memberId={member.id} memberName={member.full_name} />
                    </div>
                  ) : (
                    <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                      {member.role}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Account Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900">{currentMember?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{currentMember?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <Badge className={roleColors[currentMember?.role as keyof typeof roleColors]}>
                {currentMember?.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-900">{formatDate(currentMember?.created_at)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
