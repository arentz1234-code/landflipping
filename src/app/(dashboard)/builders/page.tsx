import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, Phone, Mail, MapPin, DollarSign, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function BuildersPage() {
  const supabase = await createClient();

  const { data: builders } = await supabase
    .from('contacts')
    .select('*')
    .eq('contact_type', 'builder')
    .order('created_at', { ascending: false });

  const activeBuilders = (builders || []).filter(b => b.status === 'active');

  return (
    <div>
      <Header
        title="Builders"
        subtitle={`${activeBuilders.length} active builders`}
        actions={
          <Link href="/builders/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Builder
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {builders && builders.length > 0 ? (
          builders.map((builder) => (
            <Link key={builder.id} href={`/builders/${builder.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {builder.first_name} {builder.last_name}
                    </h3>
                    {builder.company_name && (
                      <p className="text-sm text-gray-500">{builder.company_name}</p>
                    )}
                  </div>
                  <Badge className={builder.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {builder.status}
                  </Badge>
                </div>

                {builder.builder_type && (
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium capitalize">
                      {builder.builder_type} Builder
                    </span>
                    {builder.avg_homes_per_year && (
                      <span className="text-xs text-gray-500">
                        ({builder.avg_homes_per_year} homes/yr)
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {builder.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {builder.phone}
                    </div>
                  )}
                  {builder.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {builder.email}
                    </div>
                  )}
                  {(builder.city || builder.state) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {[builder.city, builder.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {builder.max_total_budget && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      Budget: {formatCurrency(builder.max_total_budget)}
                    </div>
                  )}
                </div>

                {builder.counties_of_interest && builder.counties_of_interest.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Counties of Interest:</p>
                    <div className="flex flex-wrap gap-1">
                      {builder.counties_of_interest.map((county: string) => (
                        <span key={county} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {county}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(builder.min_acreage || builder.max_acreage) && (
                  <div className="mt-2 text-xs text-gray-500">
                    Lot Size: {builder.min_acreage || 0} - {builder.max_acreage || '∞'} acres
                  </div>
                )}
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <p className="text-gray-500">
                No builders found.{' '}
                <Link href="/builders/new" className="text-blue-600 hover:underline">
                  Add your first builder
                </Link>
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
