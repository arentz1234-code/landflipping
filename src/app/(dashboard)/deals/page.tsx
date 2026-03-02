import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PipelineBoard } from '@/components/deals/PipelineBoard';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockDeals = [
  { id: '1', title: '10 Acres - Travis County', stage: 'lead', priority: 'medium', offer_amount: 85000, property: { county: 'Travis', state: 'TX', acreage: 10 }, assigned_member: { full_name: 'Demo User' } },
  { id: '2', title: '5 Acres - Williamson County', stage: 'contacted', priority: 'high', offer_amount: 45000, property: { county: 'Williamson', state: 'TX', acreage: 5 }, assigned_member: { full_name: 'Demo User' } },
  { id: '3', title: '20 Acres - Hays County', stage: 'offer_made', priority: 'medium', offer_amount: 150000, property: { county: 'Hays', state: 'TX', acreage: 20 }, assigned_member: { full_name: 'Demo User' } },
  { id: '4', title: 'Builder Lot - Cedar Park', stage: 'negotiating', priority: 'high', offer_amount: 65000, counter_offer_amount: 72000, property: { county: 'Williamson', state: 'TX', acreage: 0.5 }, assigned_member: { full_name: 'Demo User' } },
  { id: '5', title: '15 Acres - Bastrop', stage: 'under_contract', priority: 'urgent', agreed_price: 120000, closing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], property: { county: 'Bastrop', state: 'TX', acreage: 15 }, assigned_member: { full_name: 'Demo User' } },
];

export default async function DealsPage() {
  let deals: any[] = [];
  let userId = 'demo-user';

  if (isDevMode()) {
    deals = mockDeals;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    }

    const { data } = await supabase
      .from('deals')
      .select(`
        *,
        property:properties(county, state, acreage),
        assigned_member:team_members(full_name)
      `)
      .order('created_at', { ascending: false });

    deals = data || [];
  }

  const activeDeals = deals.filter((d: any) => !['closed_won', 'closed_lost', 'dead'].includes(d.stage));
  const totalValue = activeDeals.reduce((sum: number, d: any) => sum + (d.agreed_price || d.offer_amount || 0), 0);

  return (
    <div>
      <Header
        title="Deal Pipeline"
        subtitle={`${activeDeals.length} active deals • $${totalValue.toLocaleString()} pipeline value`}
        actions={
          <Link href="/deals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        }
      />

      <PipelineBoard deals={deals} userId={userId} />
    </div>
  );
}
