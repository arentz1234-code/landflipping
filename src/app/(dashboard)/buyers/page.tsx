import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function BuyersPage() {
  const supabase = await createClient();

  const { data: buyers } = await supabase
    .from('contacts')
    .select('*')
    .eq('contact_type', 'buyer')
    .order('created_at', { ascending: false });

  const activeBuyers = (buyers || []).filter(b => b.status === 'active');

  return (
    <div>
      <Header
        title="Buyers"
        subtitle={`${activeBuyers.length} active buyers`}
        actions={
          <Link href="/buyers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Buyer
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buyers && buyers.length > 0 ? (
          buyers.map((buyer) => (
            <Link key={buyer.id} href={`/buyers/${buyer.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {buyer.first_name} {buyer.last_name}
                    </h3>
                    {buyer.company_name && (
                      <p className="text-sm text-gray-500">{buyer.company_name}</p>
                    )}
                  </div>
                  <Badge className={buyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {buyer.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {buyer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {buyer.phone}
                    </div>
                  )}
                  {buyer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {buyer.email}
                    </div>
                  )}
                  {(buyer.city || buyer.state) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {[buyer.city, buyer.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {buyer.max_total_budget && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      Budget: {formatCurrency(buyer.max_total_budget)}
                    </div>
                  )}
                </div>

                {buyer.counties_of_interest && buyer.counties_of_interest.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Counties of Interest:</p>
                    <div className="flex flex-wrap gap-1">
                      {buyer.counties_of_interest.map((county: string) => (
                        <span key={county} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {county}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(buyer.min_acreage || buyer.max_acreage) && (
                  <div className="mt-2 text-xs text-gray-500">
                    Acreage: {buyer.min_acreage || 0} - {buyer.max_acreage || '∞'} acres
                  </div>
                )}
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <p className="text-gray-500">
                No buyers found.{' '}
                <Link href="/buyers/new" className="text-blue-600 hover:underline">
                  Add your first buyer
                </Link>
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
