import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { BuilderForm } from '@/components/contacts/BuilderForm';
import { notFound } from 'next/navigation';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockBuilders: Record<string, any> = {
  '1': {
    id: '1',
    first_name: 'Mike',
    last_name: 'Thompson',
    company_name: 'Thompson Custom Homes',
    email: 'mike@thompsonhomes.com',
    phone: '512-555-0201',
    city: 'Cedar Park',
    state: 'TX',
    counties_of_interest: ['Travis', 'Williamson'],
    min_acreage: 0.25,
    max_acreage: 2,
    max_total_budget: 200000,
    builder_type: 'custom',
    avg_homes_per_year: 12,
    preferred_lot_size: '0.5 acres',
    status: 'active',
    notes: 'High-end custom builder, needs flat lots.',
  },
  '2': {
    id: '2',
    first_name: 'Lisa',
    last_name: 'Rodriguez',
    company_name: 'Rodriguez Development',
    email: 'lisa@rodriguezdev.com',
    phone: '512-555-0202',
    city: 'Pflugerville',
    state: 'TX',
    counties_of_interest: ['Travis', 'Williamson', 'Hays'],
    min_acreage: 5,
    max_acreage: 50,
    max_total_budget: 1500000,
    builder_type: 'production',
    avg_homes_per_year: 50,
    status: 'active',
    notes: 'Production builder, looking for subdivision land.',
  },
};

export default async function EditBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let builder: any = null;

  if (isDevMode()) {
    builder = mockBuilders[id];
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('contact_type', 'builder')
      .single();
    builder = data;
  }

  if (!builder) {
    notFound();
  }

  return (
    <div>
      <Header title="Edit Builder" subtitle={`${builder.first_name} ${builder.last_name}`} />
      <BuilderForm builder={builder} />
    </div>
  );
}
