import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapWrapper } from '@/components/map/MapWrapper';
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/utils';
import { DealStage } from '@/lib/types';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockDeals = [
  {
    id: '1',
    title: '10 Acres - Travis County',
    stage: 'negotiating',
    offer_amount: 150000,
    property: { county: 'Travis', state: 'TX', acreage: 10 },
  },
  {
    id: '2',
    title: '5 Acres - Williamson County',
    stage: 'under_contract',
    agreed_price: 85000,
    property: { county: 'Williamson', state: 'TX', acreage: 5 },
  },
  {
    id: '3',
    title: '20 Acres - Hays County',
    stage: 'lead',
    offer_amount: 200000,
    property: { county: 'Hays', state: 'TX', acreage: 20 },
  },
  {
    id: '4',
    title: '15 Acres - Bastrop',
    stage: 'due_diligence',
    agreed_price: 120000,
    property: { county: 'Bastrop', state: 'TX', acreage: 15 },
  },
  {
    id: '5',
    title: '8 Acres - Bell County',
    stage: 'offer_made',
    offer_amount: 65000,
    property: { county: 'Bell', state: 'TX', acreage: 8 },
  },
  {
    id: '6',
    title: '3 Acres - Williamson',
    stage: 'contacted',
    offer_amount: 45000,
    property: { county: 'Williamson', state: 'TX', acreage: 3 },
  },
];

export default async function MapPage() {
  let deals: any[] = [];

  if (isDevMode()) {
    deals = mockDeals;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('deals')
      .select(`
        *,
        property:properties(county, state, acreage, latitude, longitude)
      `)
      .not('stage', 'in', '(closed_lost,dead)')
      .order('created_at', { ascending: false });
    deals = data || [];
  }

  // Count deals by stage
  const dealsByStage = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stages: DealStage[] = ['lead', 'contacted', 'offer_made', 'negotiating', 'under_contract', 'due_diligence', 'closed_won'];

  return (
    <div>
      <Header
        title="Deal Map"
        subtitle={`${deals.length} active deals on map`}
      />

      {/* Legend */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4">
          {stages.map((stage) => (
            <div key={stage} className="flex items-center gap-2">
              <Badge className={DEAL_STAGE_COLORS[stage]}>
                {dealsByStage[stage] || 0}
              </Badge>
              <span className="text-sm text-gray-600">
                {DEAL_STAGE_LABELS[stage]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Map */}
      <Card padding="none" className="overflow-hidden">
        <MapWrapper deals={deals} />
      </Card>

      {/* Deal List Below Map */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <a
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{deal.title}</h3>
                  <Badge className={DEAL_STAGE_COLORS[deal.stage as DealStage]}>
                    {DEAL_STAGE_LABELS[deal.stage as DealStage]}
                  </Badge>
                </div>
                {deal.property && (
                  <p className="text-sm text-gray-500">
                    {deal.property.county}, {deal.property.state}
                    {deal.property.acreage && ` • ${deal.property.acreage} acres`}
                  </p>
                )}
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
