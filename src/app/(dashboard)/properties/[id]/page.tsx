import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, MapPin, Ruler, DollarSign, Calendar, Droplets, Zap, Home } from 'lucide-react';
import {
  PROPERTY_STATUS_COLORS,
  PROPERTY_STATUS_LABELS,
  formatCurrency,
  formatAcreage,
  formatDate,
} from '@/lib/utils';
import { PropertyStatus } from '@/lib/types';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityForm } from '@/components/activity/ActivityForm';
import { DeletePropertyButton } from '@/components/properties/DeletePropertyButton';

export default async function PropertyDetailPage({
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

  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      assigned_member:team_members(full_name),
      seller_contact:contacts!seller_contact_id(id, first_name, last_name),
      buyer_contact:contacts!buyer_contact_id(id, first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (!property) {
    notFound();
  }

  const [{ data: activities }, { data: deals }, { data: tasks }] = await Promise.all([
    supabase
      .from('activity_log')
      .select('*, logged_by_member:team_members(full_name)')
      .eq('property_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('deals').select('*').eq('property_id', id),
    supabase.from('tasks').select('*').eq('property_id', id).order('due_date', { ascending: true }),
  ]);

  return (
    <div>
      <Header
        title={property.address || `${property.county}, ${property.state}`}
        subtitle={property.apn ? `APN: ${property.apn}` : undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/properties/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DeletePropertyButton propertyId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Overview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Badge className={PROPERTY_STATUS_COLORS[property.status as PropertyStatus]}>
                {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
              </Badge>
              {property.zoning && (
                <span className="text-sm text-gray-600 capitalize">{property.zoning} Zoning</span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Ruler className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                <p className="text-lg font-bold text-gray-900">{formatAcreage(property.acreage)}</p>
                <p className="text-xs text-gray-500">Acreage</p>
              </div>
              {property.purchase_price && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(property.purchase_price)}</p>
                  <p className="text-xs text-gray-500">Purchase Price</p>
                </div>
              )}
              {property.asking_price && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(property.asking_price)}</p>
                  <p className="text-xs text-gray-500">Asking Price</p>
                </div>
              )}
              {property.purchase_price_per_acre && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(property.purchase_price_per_acre)}</p>
                  <p className="text-xs text-gray-500">Per Acre</p>
                </div>
              )}
            </div>
          </Card>

          {/* Location */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    {property.address && <p className="text-gray-900">{property.address}</p>}
                    <p className="text-gray-600">{property.county}, {property.state} {property.zip}</p>
                  </div>
                </div>
                {(property.latitude && property.longitude) && (
                  <div className="text-sm text-gray-500">
                    Coords: {property.latitude}, {property.longitude}
                  </div>
                )}
              </div>
              {property.legal_description && (
                <div>
                  <p className="text-sm text-gray-500">Legal Description</p>
                  <p className="text-sm text-gray-900">{property.legal_description}</p>
                </div>
              )}
            </div>
            {(property.latitude && property.longitude) && (
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View on Google Maps →
                </a>
              </div>
            )}
          </Card>

          {/* Land Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Land Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Terrain</p>
                <p className="text-gray-900 capitalize">{property.terrain || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Road Access</p>
                <p className="text-gray-900">
                  {property.road_access ? `Yes (${property.road_type || 'Unknown'})` : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Water Source</p>
                <p className="text-gray-900 capitalize">{property.water_source || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Flood Zone</p>
                <p className="text-gray-900">{property.flood_zone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">HOA</p>
                <p className="text-gray-900">
                  {property.hoa ? `Yes (${formatCurrency(property.hoa_fee)}/yr)` : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mineral Rights</p>
                <p className="text-gray-900">{property.mineral_rights ? 'Included' : 'Excluded'}</p>
              </div>
            </div>

            {property.utilities_available && property.utilities_available.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Utilities Available</p>
                <div className="flex flex-wrap gap-2">
                  {property.utilities_available.map((util: string) => (
                    <span key={util} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded capitalize">
                      {util}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(property.restrictions || property.easements) && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.restrictions && (
                  <div>
                    <p className="text-sm text-gray-500">Deed Restrictions</p>
                    <p className="text-sm text-gray-900">{property.restrictions}</p>
                  </div>
                )}
                {property.easements && (
                  <div>
                    <p className="text-sm text-gray-500">Easements</p>
                    <p className="text-sm text-gray-900">{property.easements}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Financials */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financials</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Market Value</p>
                <p className="text-gray-900 font-medium">{formatCurrency(property.market_value)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax Assessed Value</p>
                <p className="text-gray-900">{formatCurrency(property.tax_assessed_value)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Annual Taxes</p>
                <p className="text-gray-900">{formatCurrency(property.annual_taxes)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purchase Price</p>
                <p className="text-gray-900 font-medium">{formatCurrency(property.purchase_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Asking Price</p>
                <p className="text-gray-900 font-medium">{formatCurrency(property.asking_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Closing Costs</p>
                <p className="text-gray-900">{formatCurrency(property.closing_costs)}</p>
              </div>
              {property.profit && (
                <div>
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className={`font-bold ${property.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(property.profit)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            </div>
            <ActivityForm propertyId={id} userId={user.id} />
            <div className="mt-6">
              <ActivityFeed activities={activities || []} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Dates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Acquired:</span>
                <span className="text-gray-900">{formatDate(property.acquisition_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Listed:</span>
                <span className="text-gray-900">{formatDate(property.listed_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sold:</span>
                <span className="text-gray-900">{formatDate(property.sold_date)}</span>
              </div>
            </div>
          </Card>

          {/* Contacts */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Contacts</h3>
            <div className="space-y-3">
              {property.seller_contact && (
                <Link href={`/contacts/${property.seller_contact.id}`} className="block p-2 rounded-lg hover:bg-gray-50">
                  <p className="text-xs text-gray-500">Seller</p>
                  <p className="text-sm font-medium text-gray-900">
                    {property.seller_contact.first_name} {property.seller_contact.last_name}
                  </p>
                </Link>
              )}
              {property.buyer_contact && (
                <Link href={`/contacts/${property.buyer_contact.id}`} className="block p-2 rounded-lg hover:bg-gray-50">
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {property.buyer_contact.first_name} {property.buyer_contact.last_name}
                  </p>
                </Link>
              )}
              {!property.seller_contact && !property.buyer_contact && (
                <p className="text-sm text-gray-500">No contacts linked</p>
              )}
            </div>
          </Card>

          {/* Related Deals */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Deals</h3>
            {deals && deals.length > 0 ? (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="block p-2 rounded-lg hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{deal.stage.replace('_', ' ')}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No deals yet</p>
            )}
          </Card>

          {/* Tasks */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks</h3>
            {tasks && tasks.filter(t => t.status !== 'done').length > 0 ? (
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

          {/* Tags & Notes */}
          {(property.tags?.length || property.notes) && (
            <Card>
              {property.tags && property.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {property.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {property.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{property.notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
