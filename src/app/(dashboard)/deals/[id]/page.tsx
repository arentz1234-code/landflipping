import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Calendar, DollarSign, Building, User } from 'lucide-react';
import {
  DEAL_STAGE_COLORS,
  DEAL_STAGE_LABELS,
  DEAL_STAGES,
  PRIORITY_COLORS,
  formatCurrency,
  formatDate,
  formatAcreage,
  daysUntil,
} from '@/lib/utils';
import { DealStage, TaskPriority } from '@/lib/types';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityForm } from '@/components/activity/ActivityForm';
import { DeleteDealButton } from '@/components/deals/DeleteDealButton';
import { TaskForm } from '@/components/tasks/TaskForm';

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      property:properties(*),
      buyer_contact:contacts!buyer_contact_id(id, first_name, last_name, company_name, phone, email),
      seller_contact:contacts!seller_contact_id(id, first_name, last_name, company_name, phone, email),
      assigned_member:team_members(full_name)
    `)
    .eq('id', id)
    .single();

  if (!deal) {
    notFound();
  }

  const [{ data: activities }, { data: tasks }, { data: teamMembers }] = await Promise.all([
    supabase
      .from('activity_log')
      .select('*, logged_by_member:team_members(full_name)')
      .eq('deal_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*, assigned_member:team_members(full_name)')
      .eq('deal_id', id)
      .order('due_date', { ascending: true }),
    supabase.from('team_members').select('*').order('full_name'),
  ]);

  const pipelineStages: DealStage[] = ['lead', 'contacted', 'offer_made', 'negotiating', 'under_contract', 'due_diligence', 'closed_won', 'closed_lost'];
  const currentStageIndex = pipelineStages.indexOf(deal.stage);

  const ddDays = daysUntil(deal.due_diligence_deadline);
  const closingDays = daysUntil(deal.closing_date);

  return (
    <div>
      <Header
        title={deal.title}
        subtitle={deal.deal_type === 'acquisition' ? 'Acquisition' : deal.deal_type === 'disposition' ? 'Disposition' : undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/deals/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DeleteDealButton dealId={id} />
          </div>
        }
      />

      {/* Stage Progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Deal Progress</h3>
          <Badge className={DEAL_STAGE_COLORS[deal.stage as DealStage]}>
            {DEAL_STAGE_LABELS[deal.stage as DealStage]}
          </Badge>
        </div>
        <div className="flex gap-1">
          {pipelineStages.map((stage, index) => (
            <div
              key={stage}
              className={`flex-1 h-2 rounded-full ${
                index <= currentStageIndex
                  ? stage === 'closed_won' && deal.stage === 'closed_won'
                    ? 'bg-green-500'
                    : stage === 'closed_lost' && deal.stage === 'closed_lost'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Lead</span>
          <span>Closed</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financials */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financials</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Offer Amount</p>
                <p className="text-lg font-medium text-gray-900">{formatCurrency(deal.offer_amount)}</p>
              </div>
              {deal.counter_offer_amount && (
                <div>
                  <p className="text-sm text-gray-500">Counter Offer</p>
                  <p className="text-lg font-medium text-gray-900">{formatCurrency(deal.counter_offer_amount)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Agreed Price</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(deal.agreed_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Earnest Money</p>
                <p className="text-gray-900">{formatCurrency(deal.earnest_money)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DD Fee</p>
                <p className="text-gray-900">{formatCurrency(deal.due_diligence_fee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Commission</p>
                <p className="text-gray-900">{formatCurrency(deal.commission)}</p>
              </div>
              {deal.estimated_profit && (
                <div className="col-span-full pt-4 border-t">
                  <p className="text-sm text-gray-500">Estimated Profit</p>
                  <p className={`text-2xl font-bold ${deal.estimated_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(deal.estimated_profit)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Dates */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Dates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Offer Date</p>
                <p className="text-gray-900">{formatDate(deal.offer_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contract Date</p>
                <p className="text-gray-900">{formatDate(deal.contract_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DD Deadline</p>
                <p className={`font-medium ${ddDays !== null && ddDays <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(deal.due_diligence_deadline)}
                </p>
                {ddDays !== null && (
                  <p className={`text-xs ${ddDays <= 3 ? 'text-red-600' : 'text-gray-500'}`}>
                    {ddDays === 0 ? 'Today!' : ddDays > 0 ? `${ddDays} days away` : `${Math.abs(ddDays)} days ago`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Closing Date</p>
                <p className={`font-medium ${closingDays !== null && closingDays <= 7 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {formatDate(deal.closing_date)}
                </p>
                {closingDays !== null && (
                  <p className={`text-xs ${closingDays <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {closingDays === 0 ? 'Today!' : closingDays > 0 ? `${closingDays} days away` : `${Math.abs(closingDays)} days ago`}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Title & Financing */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Title & Financing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title Company</p>
                <p className="text-gray-900 font-medium">{deal.title_company || '—'}</p>
                {deal.title_company_contact && (
                  <p className="text-sm text-gray-600">{deal.title_company_contact}</p>
                )}
                {deal.title_company_phone && (
                  <a href={`tel:${deal.title_company_phone}`} className="text-sm text-blue-600 hover:underline">
                    {deal.title_company_phone}
                  </a>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Financing</p>
                <p className="text-gray-900 font-medium capitalize">{deal.financing_type?.replace('_', ' ') || '—'}</p>
                {deal.seller_finance_terms && (
                  <p className="text-sm text-gray-600">{deal.seller_finance_terms}</p>
                )}
              </div>
            </div>
            {deal.contingencies && deal.contingencies.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Contingencies</p>
                <div className="flex flex-wrap gap-2">
                  {deal.contingencies.map((c: string) => (
                    <span key={c} className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
            </div>
            <TaskForm dealId={id} teamMembers={teamMembers || []} userId={user.id} />
            {tasks && tasks.length > 0 ? (
              <div className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className={`p-3 rounded-lg ${task.status === 'done' ? 'bg-gray-50 opacity-60' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          readOnly
                          className="rounded border-gray-300"
                        />
                        <span className={`text-sm ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                      <Badge className={PRIORITY_COLORS[task.priority as TaskPriority]}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.due_date && (
                      <p className="text-xs text-gray-500 ml-6 mt-1">Due: {formatDate(task.due_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No tasks yet</p>
            )}
          </Card>

          {/* Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            </div>
            <ActivityForm dealId={id} userId={user.id} />
            <div className="mt-6">
              <ActivityFeed activities={activities || []} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                {deal.assigned_member?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{deal.assigned_member?.full_name || 'Unassigned'}</p>
                <Badge className={PRIORITY_COLORS[deal.priority as TaskPriority]}>{deal.priority} priority</Badge>
              </div>
            </div>
          </Card>

          {/* Property */}
          {deal.property && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Property</h3>
              <Link href={`/properties/${deal.property.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                <p className="font-medium text-gray-900">
                  {deal.property.address || `${deal.property.county}, ${deal.property.state}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">{formatAcreage(deal.property.acreage)}</p>
                {deal.property.apn && (
                  <p className="text-xs text-gray-400">APN: {deal.property.apn}</p>
                )}
              </Link>
            </Card>
          )}

          {/* Seller Contact */}
          {deal.seller_contact && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller</h3>
              <Link href={`/contacts/${deal.seller_contact.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                <p className="font-medium text-gray-900">
                  {deal.seller_contact.first_name} {deal.seller_contact.last_name}
                </p>
                {deal.seller_contact.company_name && (
                  <p className="text-sm text-gray-500">{deal.seller_contact.company_name}</p>
                )}
                {deal.seller_contact.phone && (
                  <a href={`tel:${deal.seller_contact.phone}`} className="text-sm text-blue-600 hover:underline block mt-1">
                    {deal.seller_contact.phone}
                  </a>
                )}
              </Link>
            </Card>
          )}

          {/* Buyer Contact */}
          {deal.buyer_contact && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Buyer</h3>
              <Link href={`/contacts/${deal.buyer_contact.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                <p className="font-medium text-gray-900">
                  {deal.buyer_contact.first_name} {deal.buyer_contact.last_name}
                </p>
                {deal.buyer_contact.company_name && (
                  <p className="text-sm text-gray-500">{deal.buyer_contact.company_name}</p>
                )}
                {deal.buyer_contact.phone && (
                  <a href={`tel:${deal.buyer_contact.phone}`} className="text-sm text-blue-600 hover:underline block mt-1">
                    {deal.buyer_contact.phone}
                  </a>
                )}
              </Link>
            </Card>
          )}

          {/* Tags & Notes */}
          {(deal.tags?.length || deal.notes) && (
            <Card>
              {deal.tags && deal.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {deal.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {deal.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
