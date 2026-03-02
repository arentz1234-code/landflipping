import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, MapPin, Ruler, DollarSign } from 'lucide-react';
import {
  PROPERTY_STATUS_COLORS,
  PROPERTY_STATUS_LABELS,
  formatCurrency,
  formatAcreage,
} from '@/lib/utils';
import { PropertyStatus } from '@/lib/types';
import { PropertyFilters } from '@/components/properties/PropertyFilters';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockProperties = [
  { id: '1', apn: '123-456-789', address: '1234 Rural Rd', county: 'Travis', state: 'TX', acreage: 10.5, zoning: 'residential', status: 'owned', purchase_price: 85000, asking_price: 120000, assigned_member: { full_name: 'Demo User' } },
  { id: '2', apn: '987-654-321', county: 'Williamson', state: 'TX', acreage: 5.2, zoning: 'agricultural', status: 'listed_for_sale', purchase_price: 45000, asking_price: 65000, assigned_member: { full_name: 'Demo User' } },
  { id: '3', county: 'Hays', state: 'TX', acreage: 20, zoning: 'residential', status: 'researching', assigned_member: { full_name: 'Demo User' } },
];

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; county?: string; state?: string; view?: string }>;
}) {
  const params = await searchParams;

  let properties: any[] = [];

  if (isDevMode()) {
    properties = mockProperties;
  } else {
    const supabase = await createClient();

    let query = supabase
      .from('properties')
      .select('*, assigned_member:team_members(full_name), seller_contact:contacts!seller_contact_id(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.county) {
      query = query.ilike('county', `%${params.county}%`);
    }
    if (params.state) {
      query = query.eq('state', params.state);
    }

    const { data } = await query;
    properties = data || [];
  }

  const isCardView = params.view !== 'table';

  return (
    <div>
      <Header
        title="Properties"
        subtitle={`${properties?.length || 0} properties`}
        actions={
          <Link href="/properties/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        }
      />

      <PropertyFilters />

      {isCardView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties && properties.length > 0 ? (
            properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={PROPERTY_STATUS_COLORS[property.status as PropertyStatus]}>
                      {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
                    </Badge>
                    {property.zoning && (
                      <span className="text-xs text-gray-500 capitalize">{property.zoning}</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">
                    {property.address || `${property.county}, ${property.state}`}
                  </h3>
                  {property.apn && (
                    <p className="text-xs text-gray-500 mb-3">APN: {property.apn}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {property.county}, {property.state}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Ruler className="w-4 h-4" />
                      {formatAcreage(property.acreage)}
                    </div>
                    {(property.purchase_price || property.asking_price) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {property.asking_price
                          ? `Asking: ${formatCurrency(property.asking_price)}`
                          : `Bought: ${formatCurrency(property.purchase_price)}`}
                      </div>
                    )}
                  </div>

                  {property.assigned_member && (
                    <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                      Assigned to {property.assigned_member.full_name}
                    </div>
                  )}
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <p className="text-gray-500">
                  No properties found.{' '}
                  <Link href="/properties/new" className="text-blue-600 hover:underline">
                    Add your first property
                  </Link>
                </p>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Property
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Location
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Acreage
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Purchase Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Asking Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {properties && properties.length > 0 ? (
                  properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/properties/${property.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {property.address || property.apn || 'Unnamed Property'}
                        </Link>
                        {property.zoning && (
                          <p className="text-xs text-gray-500 capitalize">{property.zoning}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {property.county}, {property.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatAcreage(property.acreage)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={PROPERTY_STATUS_COLORS[property.status as PropertyStatus]}>
                          {PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(property.purchase_price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(property.asking_price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {property.assigned_member?.full_name || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No properties found.{' '}
                      <Link href="/properties/new" className="text-blue-600 hover:underline">
                        Add your first property
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
