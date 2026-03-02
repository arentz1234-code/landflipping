import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Database,
  Settings,
  Shield,
  Download,
  Trash2,
  UserPlus,
  Activity
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockTeamMembers = [
  { id: 'demo-user', full_name: 'Demo User', email: 'demo@example.com', role: 'admin', created_at: new Date().toISOString() },
  { id: 'member-2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'member', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'member-3', full_name: 'Bob Wilson', email: 'bob@example.com', role: 'viewer', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

const mockStats = {
  totalBuyers: 12,
  totalBuilders: 8,
  totalDeals: 25,
  completedDeals: 6,
  totalTasks: 45,
  completedTasks: 32,
};

const mockActivityLog = [
  { id: '1', action: 'Created new buyer', user: 'Demo User', timestamp: new Date().toISOString() },
  { id: '2', action: 'Closed deal: 15 Acres Bastrop', user: 'Demo User', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '3', action: 'Added new builder', user: 'Jane Smith', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: '4', action: 'Updated task status', user: 'Demo User', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

export default async function AdminPage() {
  let teamMembers: any[] = [];
  let stats = mockStats;
  let activityLog = mockActivityLog;
  let currentUser: any = null;

  if (isDevMode()) {
    teamMembers = mockTeamMembers;
    currentUser = mockTeamMembers[0];
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: tm } = await supabase.from('team_members').select('*').order('created_at');
      const { data: cu } = await supabase.from('team_members').select('*').eq('id', user.id).single();

      // Get real stats
      const [buyers, builders, deals, tasks] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('contact_type', 'buyer'),
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('contact_type', 'builder'),
        supabase.from('deals').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
      ]);

      teamMembers = tm || [];
      currentUser = cu;
      stats = {
        totalBuyers: buyers.count || 0,
        totalBuilders: builders.count || 0,
        totalDeals: deals.count || 0,
        completedDeals: 0,
        totalTasks: tasks.count || 0,
        completedTasks: 0,
      };
    }
  }

  const isAdmin = currentUser?.role === 'admin';

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    member: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <Header
        title="Admin"
        subtitle="System administration and settings"
      />

      {!isAdmin && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">You need admin privileges to modify settings.</p>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalBuyers}</p>
          <p className="text-sm text-gray-500">Buyers</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalBuilders}</p>
          <p className="text-sm text-gray-500">Builders</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
          <p className="text-sm text-gray-500">Total Deals</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completedDeals}</p>
          <p className="text-sm text-gray-500">Closed Deals</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          <p className="text-sm text-gray-500">Total Tasks</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
          <p className="text-sm text-gray-500">Done Tasks</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Management */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            {isAdmin && (
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {member.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.full_name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <Badge className={roleColors[member.role]}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500">
                    by {log.user} • {formatDate(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Export All Data</p>
                <p className="text-sm text-gray-500">Download all contacts, deals, and tasks as CSV</p>
              </div>
              <Button variant="secondary" size="sm" disabled={!isAdmin}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Export Buyers</p>
                <p className="text-sm text-gray-500">Download buyer contacts as CSV</p>
              </div>
              <Button variant="secondary" size="sm" disabled={!isAdmin}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Export Builders</p>
                <p className="text-sm text-gray-500">Download builder contacts as CSV</p>
              </div>
              <Button variant="secondary" size="sm" disabled={!isAdmin}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Database Status</p>
                <p className="text-sm text-gray-500">
                  {isDevMode() ? 'Demo Mode (No database)' : 'Connected to Supabase'}
                </p>
              </div>
              <Badge className={isDevMode() ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                {isDevMode() ? 'Demo' : 'Live'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Application Version</p>
                <p className="text-sm text-gray-500">LandCRM v1.0.0</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">Latest</Badge>
            </div>
            {isAdmin && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                <div>
                  <p className="font-medium text-red-900">Danger Zone</p>
                  <p className="text-sm text-red-600">Clear all demo data</p>
                </div>
                <Button variant="secondary" size="sm" className="border-red-300 text-red-600 hover:bg-red-100">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
