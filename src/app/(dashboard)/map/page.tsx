import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapWrapper } from '@/components/map/MapWrapper';
import { DEAL_STAGE_COLORS, DEAL_STAGE_LABELS } from '@/lib/utils';
import { DealStage } from '@/lib/types';

export default async function MapPage() {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      property:properties(county, state, acreage, latitude, longitude)
    `)
    .not('stage', 'in', '(closed_lost,dead)')
    .order('created_at', { ascending: false });

  // Count deals by stage
  const dealsByStage = (deals || []).reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stages: DealStage[] = ['lead', 'contacted', 'offer_made', 'negotiating', 'under_contract', 'due_diligence', 'closed_won'];

  return (
    <div>
      <Header
        title="Deal Map"
        subtitle={`${deals?.length || 0} active deals on map`}
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
        <MapWrapper deals={deals || []} />
      </Card>

      {/* Deal List Below Map */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals && deals.length > 0 ? (
            deals.map((deal) => (
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
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <p className="text-gray-500">No deals to display on map.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
