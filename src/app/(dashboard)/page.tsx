import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  HardHat,
  CheckSquare,
  Trophy,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  formatCurrency,
  DEAL_STAGE_COLORS,
  DEAL_STAGE_LABELS,
  PRIORITY_COLORS,
} from '@/lib/utils';
import { DealStage, TaskPriority } from '@/lib/types';
import Link from 'next/link';

const isDevMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;
};

const mockBuyers = [
  { id: '1', first_name: 'John', last_name: 'Smith', status: 'active' },
  { id: '2', first_name: 'Sarah', last_name: 'Johnson', status: 'active' },
  { id: '3', first_name: 'Michael', last_name: 'Davis', status: 'active' },
];

const mockBuilders = [
  { id: '1', first_name: 'Mike', last_name: 'Thompson', company_name: 'Thompson Custom Homes', status: 'active' },
  { id: '2', first_name: 'Lisa', last_name: 'Rodriguez', company_name: 'Rodriguez Development', status: 'active' },
];

const mockTasks = [
  { id: '1', title: 'Call seller about Travis property', priority: 'high', due_date: new Date().toISOString().split('T')[0], status: 'todo' },
  { id: '2', title: 'Send offer letter', priority: 'medium', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'todo' },
  { id: '3', title: 'Schedule site visit', priority: 'low', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'in_progress' },
];

const mockCompletedDeals = [
  { id: '1', title: '15 Acres - Bastrop', stage: 'closed_won', agreed_price: 90000, estimated_profit: 45000 },
  { id: '2', title: '8 Acres - Hays', stage: 'closed_won', agreed_price: 115000, estimated_profit: 35000 },
];

const mockActiveDeals = [
  { id: '3', title: '10 Acres - Travis', stage: 'negotiating', offer_amount: 150000 },
  { id: '4', title: '5 Acres - Williamson', stage: 'under_contract', agreed_price: 85000 },
];

export default async function DashboardPage() {
  let buyers: any[] = [];
  let builders: any[] = [];
  let tasks: any[] = [];
  let completedDeals: any[] = [];
  let activeDeals: any[] = [];

  if (isDevMode()) {
    buyers = mockBuyers;
    builders = mockBuilders;
    tasks = mockTasks;
    completedDeals = mockCompletedDeals;
    activeDeals = mockActiveDeals;
  } else {
    const supabase = await createClient();

    const [
      { data: b },
      { data: bl },
      { data: t },
      { data: cd },
      { data: ad },
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('contact_type', 'buyer').eq('status', 'active'),
      supabase.from('contacts').select('*').eq('contact_type', 'builder').eq('status', 'active'),
      supabase.from('tasks').select('*').neq('status', 'done').order('due_date', { ascending: true }).limit(5),
      supabase.from('deals').select('*').eq('stage', 'closed_won').order('closing_date', { ascending: false }).limit(5),
      supabase.from('deals').select('*').not('stage', 'in', '(closed_won,closed_lost,dead)').order('created_at', { ascending: false }),
    ]);

    buyers = b || [];
    builders = bl || [];
    tasks = t || [];
    completedDeals = cd || [];
    activeDeals = ad || [];
  }

  const totalProfit = completedDeals.reduce((sum, d) => sum + (d.estimated_profit || 0), 0);
  const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.agreed_price || d.offer_amount || 0), 0);
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  const stats = [
    {
      name: 'Active Buyers',
      value: buyers.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/buyers',
    },
    {
      name: 'Active Builders',
      value: builders.length,
      icon: HardHat,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/builders',
    },
    {
      name: 'Pending Tasks',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/tasks',
    },
    {
      name: 'Completed Deals',
      value: completedDeals.length,
      subValue: formatCurrency(totalProfit) + ' profit',
      icon: Trophy,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/completed-deals',
    },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-sm text-green-600">{stat.subValue}</p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pipeline Summary */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Active Pipeline</h2>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600">{formatCurrency(pipelineValue)}</span>
          </div>
        </div>
        <div className="space-y-3">
          {activeDeals.length > 0 ? (
            activeDeals.slice(0, 5).map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(deal.agreed_price || deal.offer_amount)}
                    </p>
                  </div>
                  <Badge className={DEAL_STAGE_COLORS[deal.stage as DealStage]}>
                    {DEAL_STAGE_LABELS[deal.stage as DealStage]}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No active deals</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href="/map" className="text-sm text-blue-600 hover:text-blue-700">
            View all deals on map →
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            </div>
            <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500">Due: {task.due_date}</p>
                    )}
                  </div>
                  <Badge className={PRIORITY_COLORS[task.priority as TaskPriority]}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No pending tasks</p>
            )}
          </div>
        </Card>

        {/* Recent Completed Deals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Wins</h2>
            </div>
            <Link href="/completed-deals" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {completedDeals.length > 0 ? (
              completedDeals.slice(0, 5).map((deal) => (
                <Link key={deal.id} href={`/completed-deals/${deal.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-500">
                        Sold for {formatCurrency(deal.agreed_price)}
                      </p>
                    </div>
                    {deal.estimated_profit && (
                      <span className="text-sm font-semibold text-green-600">
                        +{formatCurrency(deal.estimated_profit)}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No completed deals yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
