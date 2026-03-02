import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Mail, MapPin, DollarSign, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockBuyers: Record<string, any> = {
  '1': {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    company_name: 'Smith Investments',
    email: 'john@smith.com',
    phone: '512-555-0101',
    city: 'Austin',
    state: 'TX',
    counties_of_interest: ['Travis', 'Williamson', 'Hays'],
    min_acreage: 5,
    max_acreage: 50,
    max_total_budget: 500000,
    financing_type: 'cash',
    status: 'active',
    notes: 'Looking for land to hold long-term. Prefers properties with road access.',
    created_at: '2024-01-15',
  },
  '2': {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@email.com',
    phone: '512-555-0102',
    city: 'Round Rock',
    state: 'TX',
    counties_of_interest: ['Williamson'],
    min_acreage: 1,
    max_acreage: 10,
    max_total_budget: 150000,
    financing_type: 'conventional',
    status: 'active',
    notes: 'First-time land buyer',
    created_at: '2024-02-01',
  },
};

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let buyer: any = null;

  if (isDevMode()) {
    buyer = mockBuyers[id];
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('contact_type', 'buyer')
      .single();
    buyer = data;
  }

  if (!buyer) {
    notFound();
  }

  return (
    <div>
      <Header
        title={`${buyer.first_name} ${buyer.last_name}`}
        subtitle={buyer.company_name || 'Buyer'}
        actions={
          <Link href={`/buyers/${id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Buyer
            </Button>
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <Badge className={buyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
              {buyer.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyer.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <a href={`tel:${buyer.phone}`} className="text-gray-900 hover:text-blue-600">
                    {buyer.phone}
                  </a>
                </div>
              </div>
            )}
            {buyer.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${buyer.email}`} className="text-gray-900 hover:text-blue-600">
                    {buyer.email}
                  </a>
                </div>
              </div>
            )}
            {(buyer.city || buyer.state) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-900">{[buyer.city, buyer.state].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            )}
            {buyer.max_total_budget && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Max Budget</p>
                  <p className="text-gray-900">{formatCurrency(buyer.max_total_budget)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Buying Criteria</h2>
          <div className="space-y-4">
            {buyer.counties_of_interest && buyer.counties_of_interest.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Counties of Interest</p>
                <div className="flex flex-wrap gap-2">
                  {buyer.counties_of_interest.map((county: string) => (
                    <span key={county} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {county}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(buyer.min_acreage || buyer.max_acreage) && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Acreage Range</p>
                  <p className="text-gray-900 font-medium">
                    {buyer.min_acreage || 0} - {buyer.max_acreage || '∞'} acres
                  </p>
                </div>
              )}
              {buyer.financing_type && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Financing</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {buyer.financing_type.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {buyer.notes && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{buyer.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
