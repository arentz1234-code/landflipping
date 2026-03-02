import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trophy, MapPin, DollarSign, Calendar, TrendingUp, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockDeals: Record<string, any> = {
  '1': {
    id: '1',
    title: '15 Acres - Bastrop County',
    stage: 'closed_won',
    deal_type: 'acquisition',
    offer_amount: 95000,
    agreed_price: 90000,
    closing_date: '2024-01-15',
    property: { county: 'Bastrop', state: 'TX', acreage: 15, address: '1234 County Road' },
    buyer_contact: { first_name: 'John', last_name: 'Smith', company_name: 'Smith Investments' },
    estimated_profit: 45000,
    notes: 'Clean title, quick closing. Buyer plans to hold for appreciation.',
    created_at: '2023-12-01',
  },
  '2': {
    id: '2',
    title: '8 Acres - Hays County',
    stage: 'closed_won',
    deal_type: 'disposition',
    offer_amount: 120000,
    agreed_price: 115000,
    closing_date: '2024-02-01',
    property: { county: 'Hays', state: 'TX', acreage: 8 },
    buyer_contact: { first_name: 'Mike', last_name: 'Thompson', company_name: 'Thompson Custom Homes' },
    estimated_profit: 35000,
    notes: 'Sold to builder for custom home development.',
    created_at: '2024-01-01',
  },
};

export default async function CompletedDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let deal: any = null;

  if (isDevMode()) {
    deal = mockDeals[id];
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('deals')
      .select(`
        *,
        property:properties(county, state, acreage, address),
        buyer_contact:contacts!buyer_contact_id(first_name, last_name, company_name)
      `)
      .eq('id', id)
      .eq('stage', 'closed_won')
      .single();
    deal = data;
  }

  if (!deal) {
    notFound();
  }

  return (
    <div>
      <Header
        title={deal.title}
        subtitle="Completed Deal"
      />

      <div className="max-w-4xl space-y-6">
        {/* Success Banner */}
        <Card className="bg-green-50 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-green-800">Deal Closed Successfully</h2>
              <p className="text-green-600">
                Closed on {formatDate(deal.closing_date)} for {formatCurrency(deal.agreed_price)}
              </p>
            </div>
            {deal.estimated_profit && (
              <div className="text-right">
                <p className="text-sm text-green-600">Profit</p>
                <p className="text-2xl font-bold text-green-700">+{formatCurrency(deal.estimated_profit)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Deal Details */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Sale Price</p>
                <p className="text-gray-900 font-medium">{formatCurrency(deal.agreed_price)}</p>
              </div>
            </div>
            {deal.offer_amount && deal.offer_amount !== deal.agreed_price && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Original Offer</p>
                  <p className="text-gray-900">{formatCurrency(deal.offer_amount)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Closing Date</p>
                <p className="text-gray-900">{formatDate(deal.closing_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Deal Type</p>
                <p className="text-gray-900 capitalize">{deal.deal_type}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Property Info */}
        {deal.property && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-900">{deal.property.county}, {deal.property.state}</p>
                </div>
              </div>
              {deal.property.acreage && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Acreage</p>
                    <p className="text-gray-900">{deal.property.acreage} acres</p>
                  </div>
                </div>
              )}
              {deal.property.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-900">{deal.property.address}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Buyer Info */}
        {deal.buyer_contact && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer</h2>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">
                  {deal.buyer_contact.first_name} {deal.buyer_contact.last_name}
                </p>
                {deal.buyer_contact.company_name && (
                  <p className="text-sm text-gray-500">{deal.buyer_contact.company_name}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {deal.notes && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{deal.notes}</p>
          </Card>
        )}

        <div className="flex gap-3">
          <Link href="/completed-deals">
            <Badge className="bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer hover:bg-gray-200">
              ← Back to Completed Deals
            </Badge>
          </Link>
        </div>
      </div>
    </div>
  );
}
