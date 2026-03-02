import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Mail, MapPin, DollarSign, Edit, Building2, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function BuilderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: builder } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('contact_type', 'builder')
    .single();

  if (!builder) {
    notFound();
  }

  return (
    <div>
      <Header
        title={`${builder.first_name} ${builder.last_name}`}
        subtitle={builder.company_name || 'Builder'}
        actions={
          <Link href={`/builders/${id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Builder
            </Button>
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <Badge className={builder.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
              {builder.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builder.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <a href={`tel:${builder.phone}`} className="text-gray-900 hover:text-blue-600">
                    {builder.phone}
                  </a>
                </div>
              </div>
            )}
            {builder.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${builder.email}`} className="text-gray-900 hover:text-blue-600">
                    {builder.email}
                  </a>
                </div>
              </div>
            )}
            {(builder.city || builder.state) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-900">{[builder.city, builder.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            )}
            {builder.max_total_budget && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Max Budget Per Lot</p>
                  <p className="text-gray-900">{formatCurrency(builder.max_total_budget)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Builder Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {builder.builder_type && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Builder Type</p>
                  <p className="text-gray-900 font-medium capitalize">{builder.builder_type} Builder</p>
                </div>
              </div>
            )}
            {builder.avg_homes_per_year && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <Home className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Homes Per Year</p>
                  <p className="text-gray-900 font-medium">{builder.avg_homes_per_year}</p>
                </div>
              </div>
            )}
            {builder.preferred_lot_size && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Preferred Lot Size</p>
                  <p className="text-gray-900 font-medium">{builder.preferred_lot_size}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buying Criteria</h2>
          <div className="space-y-4">
            {builder.counties_of_interest && builder.counties_of_interest.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Counties of Interest</p>
                <div className="flex flex-wrap gap-2">
                  {builder.counties_of_interest.map((county: string) => (
                    <span key={county} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                      {county}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(builder.min_acreage || builder.max_acreage) && (
              <div className="p-3 rounded-lg bg-gray-50 inline-block">
                <p className="text-xs text-gray-500">Lot Size Range</p>
                <p className="text-gray-900 font-medium">
                  {builder.min_acreage || 0} - {builder.max_acreage || '∞'} acres
                </p>
              </div>
            )}
          </div>
        </Card>

        {builder.notes && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{builder.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
