import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';

// Check if we're in dev mode (no real Supabase)
const isDevMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

// Mock user for dev mode
const mockUser = {
  id: 'demo-user',
  full_name: 'Demo User',
  email: 'demo@example.com',
  phone: null,
  role: 'admin' as const,
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDevMode()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar user={mockUser} />
        <main className="lg:pl-64 pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Connect Supabase to save data. See CLAUDE.md for setup instructions.
            </div>
            {children}
          </div>
        </main>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let teamMember = null;
  if (user) {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', user.id)
      .single();
    teamMember = data;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={teamMember} />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
