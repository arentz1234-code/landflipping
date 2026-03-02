import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Phone, Mail, MapPin, Building, DollarSign, Ruler } from 'lucide-react';
import {
  CONTACT_TYPE_COLORS,
  CONTACT_TYPE_LABELS,
  formatCurrency,
  formatDate,
  formatDateTime,
  contactFullName,
} from '@/lib/utils';
import { ContactType } from '@/lib/types';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityForm } from '@/components/activity/ActivityForm';
import { DeleteContactButton } from '@/components/contacts/DeleteContactButton';

export default async function ContactDetailPage({
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

  const { data: contact } = await supabase
    .from('contacts')
    .select('*, assigned_member:team_members(full_name)')
    .eq('id', id)
    .single();

  if (!contact) {
    notFound();
  }

  const [
    { data: activities },
    { data: deals },
    { data: properties },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from('activity_log')
      .select('*, logged_by_member:team_members(full_name)')
      .eq('contact_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('deals')
      .select('*')
      .or(`buyer_contact_id.eq.${id},seller_contact_id.eq.${id}`),
    supabase
      .from('properties')
      .select('*')
      .or(`seller_contact_id.eq.${id},buyer_contact_id.eq.${id}`),
    supabase
      .from('tasks')
      .select('*')
      .eq('contact_id', id)
      .order('due_date', { ascending: true }),
  ]);

  const isBuyerOrBuilder = contact.contact_type === 'buyer' || contact.contact_type === 'builder';
  const isSeller = contact.contact_type === 'seller';

  return (
    <div>
      <Header
        title={contactFullName(contact)}
        subtitle={contact.company_name || undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/contacts/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DeleteContactButton contactId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info Card */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <Badge className={CONTACT_TYPE_COLORS[contact.contact_type as ContactType]}>
                {CONTACT_TYPE_LABELS[contact.contact_type as ContactType]}
              </Badge>
              <span className={`text-sm px-2 py-1 rounded ${contact.status === 'active' ? 'bg-green-100 text-green-700' : contact.status === 'do_not_contact' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {contact.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.phone_secondary && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${contact.phone_secondary}`} className="text-blue-600 hover:underline">
                      {contact.phone_secondary}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {(contact.mailing_address || contact.city || contact.state) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-gray-600">
                      {contact.mailing_address && <p>{contact.mailing_address}</p>}
                      <p>{[contact.city, contact.state, contact.zip].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Source:</span>
                  <span className="text-gray-900">{contact.source || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To:</span>
                  <span className="text-gray-900">{contact.assigned_member?.full_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Contacted:</span>
                  <span className="text-gray-900">{formatDate(contact.last_contacted_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">{formatDate(contact.created_at)}</span>
                </div>
              </div>
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contact.notes && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </Card>

          {/* Buying Criteria (for buyers/builders) */}
          {isBuyerOrBuilder && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buying Criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {contact.counties_of_interest && contact.counties_of_interest.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Counties:</span>
                      <p className="text-gray-900">{contact.counties_of_interest.join(', ')}</p>
                    </div>
                  )}
                  {contact.states_of_interest && contact.states_of_interest.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">States:</span>
                      <p className="text-gray-900">{contact.states_of_interest.join(', ')}</p>
                    </div>
                  )}
                  {(contact.min_acreage || contact.max_acreage) && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {contact.min_acreage || 0} - {contact.max_acreage || '∞'} acres
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {(contact.min_price_per_acre || contact.max_price_per_acre) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatCurrency(contact.min_price_per_acre)} - {formatCurrency(contact.max_price_per_acre)} / acre
                      </span>
                    </div>
                  )}
                  {contact.max_total_budget && (
                    <div>
                      <span className="text-sm text-gray-500">Max Budget:</span>
                      <p className="text-gray-900 font-medium">{formatCurrency(contact.max_total_budget)}</p>
                    </div>
                  )}
                  {contact.preferred_zoning && contact.preferred_zoning.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Zoning:</span>
                      <p className="text-gray-900 capitalize">{contact.preferred_zoning.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {contact.needs_road_access && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Needs Road Access</span>
                )}
                {contact.needs_utilities && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Needs Utilities</span>
                )}
                {contact.needs_water && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Needs Water</span>
                )}
              </div>

              {contact.contact_type === 'builder' && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Builder Details</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="text-gray-900 capitalize">{contact.builder_type?.replace('_', ' ') || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Homes/Year:</span>
                      <p className="text-gray-900">{contact.avg_homes_per_year || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Lot Size:</span>
                      <p className="text-gray-900">{contact.preferred_lot_size || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Seller Details */}
          {isSeller && (contact.motivation_level || contact.asking_price || contact.reason_for_selling) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contact.motivation_level && (
                  <div>
                    <span className="text-sm text-gray-500">Motivation Level</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${contact.motivation_level >= 8 ? 'bg-green-500' : contact.motivation_level >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${contact.motivation_level * 10}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-gray-900">{contact.motivation_level}/10</span>
                    </div>
                  </div>
                )}
                {contact.asking_price && (
                  <div>
                    <span className="text-sm text-gray-500">Asking Price</span>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(contact.asking_price)}</p>
                  </div>
                )}
              </div>
              {contact.reason_for_selling && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Reason for Selling</span>
                  <p className="text-gray-900 mt-1">{contact.reason_for_selling}</p>
                </div>
              )}
            </Card>
          )}

          {/* Activity Feed */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            </div>
            <ActivityForm contactId={id} userId={user.id} />
            <div className="mt-6">
              <ActivityFeed activities={activities || []} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Deals */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Deals</h3>
            {deals && deals.length > 0 ? (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="block p-2 rounded-lg hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{deal.stage.replace('_', ' ')}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No deals yet</p>
            )}
          </Card>

          {/* Related Properties */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Properties</h3>
            {properties && properties.length > 0 ? (
              <div className="space-y-2">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="block p-2 rounded-lg hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {property.address || `${property.county}, ${property.state}`}
                    </p>
                    <p className="text-xs text-gray-500">{property.acreage} acres</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No properties yet</p>
            )}
          </Card>

          {/* Related Tasks */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks</h3>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.filter(t => t.status !== 'done').map((task) => (
                  <div key={task.id} className="p-2 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500">Due: {formatDate(task.due_date)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No open tasks</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
