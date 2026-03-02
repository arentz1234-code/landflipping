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

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: teamMembers },
    { data: currentUser },
    { count: buyersCount },
    { count: buildersCount },
    { count: dealsCount },
    { count: completedDealsCount },
    { count: tasksCount },
    { count: completedTasksCount },
    { data: activityLog },
  ] = await Promise.all([
    supabase.from('team_members').select('*').order('created_at'),
    supabase.from('team_members').select('*').eq('id', user?.id).single(),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('contact_type', 'buyer'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('contact_type', 'builder'),
    supabase.from('deals').select('*', { count: 'exact', head: true }),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('stage', 'closed_won'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
    supabase.from('activity_log').select('*, logged_by_member:team_members(full_name)').order('created_at', { ascending: false }).limit(10),
  ]);

  const isAdmin = currentUser?.role === 'admin';

  const stats = {
    totalBuyers: buyersCount || 0,
    totalBuilders: buildersCount || 0,
    totalDeals: dealsCount || 0,
    completedDeals: completedDealsCount || 0,
    totalTasks: tasksCount || 0,
    completedTasks: completedTasksCount || 0,
  };

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
            {teamMembers && teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {member.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.full_name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <Badge className={roleColors[member.role] || roleColors.viewer}>
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
            {activityLog && activityLog.length > 0 ? (
              activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{log.subject || log.activity_type}</p>
                    <p className="text-xs text-gray-500">
                      by {log.logged_by_member?.full_name || 'Unknown'} • {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
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
                <p className="text-sm text-gray-500">Connected to Supabase</p>
              </div>
              <Badge className="bg-green-100 text-green-700">Live</Badge>
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
                  <p className="text-sm text-red-600">Clear all data (irreversible)</p>
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
