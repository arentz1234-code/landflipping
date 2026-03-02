import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Trophy, MapPin, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockCompletedDeals = [
  {
    id: '1',
    title: '15 Acres - Bastrop County',
    stage: 'closed_won',
    deal_type: 'acquisition',
    offer_amount: 95000,
    agreed_price: 90000,
    closing_date: '2024-01-15',
    property: { county: 'Bastrop', state: 'TX', acreage: 15 },
    buyer_contact: { first_name: 'John', last_name: 'Smith' },
    estimated_profit: 45000,
  },
  {
    id: '2',
    title: '8 Acres - Hays County',
    stage: 'closed_won',
    deal_type: 'disposition',
    offer_amount: 120000,
    agreed_price: 115000,
    closing_date: '2024-02-01',
    property: { county: 'Hays', state: 'TX', acreage: 8 },
    buyer_contact: { first_name: 'Sarah', last_name: 'Johnson' },
    estimated_profit: 35000,
  },
  {
    id: '3',
    title: '25 Acres - Williamson County',
    stage: 'closed_won',
    deal_type: 'acquisition',
    offer_amount: 200000,
    agreed_price: 185000,
    closing_date: '2024-02-20',
    property: { county: 'Williamson', state: 'TX', acreage: 25 },
    buyer_contact: { first_name: 'Mike', last_name: 'Thompson' },
    estimated_profit: 75000,
  },
];

export default async function CompletedDealsPage() {
  let deals: any[] = [];

  if (isDevMode()) {
    deals = mockCompletedDeals;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('deals')
      .select(`
        *,
        property:properties(county, state, acreage),
        buyer_contact:contacts!buyer_contact_id(first_name, last_name)
      `)
      .eq('stage', 'closed_won')
      .order('closing_date', { ascending: false });
    deals = data || [];
  }

  const totalProfit = deals.reduce((sum, d) => sum + (d.estimated_profit || 0), 0);
  const totalVolume = deals.reduce((sum, d) => sum + (d.agreed_price || 0), 0);

  return (
    <div>
      <Header
        title="Completed Deals"
        subtitle={`${deals.length} deals closed`}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Deals</p>
            <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalVolume)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-100">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Profit</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
          </div>
        </Card>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <Link key={deal.id} href={`/completed-deals/${deal.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {deal.property && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {deal.property.county}, {deal.property.state}
                          </span>
                        )}
                        {deal.closing_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Closed {formatDate(deal.closing_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Sale Price</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(deal.agreed_price)}</p>
                      </div>
                      {deal.estimated_profit && (
                        <div>
                          <p className="text-sm text-gray-500">Profit</p>
                          <p className="font-semibold text-green-600">+{formatCurrency(deal.estimated_profit)}</p>
                        </div>
                      )}
                      <Badge className="bg-green-100 text-green-700">
                        {deal.deal_type === 'acquisition' ? 'Bought' : 'Sold'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {deal.buyer_contact && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                    Buyer: {deal.buyer_contact.first_name} {deal.buyer_contact.last_name}
                  </div>
                )}
              </Card>
            </Link>
          ))
        ) : (
          <Card className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No completed deals yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              When you close a deal, it will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
