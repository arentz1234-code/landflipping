import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { BuyerForm } from '@/components/contacts/BuyerForm';
import { notFound } from 'next/navigation';

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
    notes: 'Looking for land to hold long-term.',
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
  },
};

export default async function EditBuyerPage({
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
      <Header title="Edit Buyer" subtitle={`${buyer.first_name} ${buyer.last_name}`} />
      <BuyerForm buyer={buyer} />
    </div>
  );
}
