import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { DealForm } from '@/components/deals/DealForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: deal }, { data: teamMembers }, { data: properties }, { data: contacts }] = await Promise.all([
    supabase.from('deals').select('*').eq('id', id).single(),
    supabase.from('team_members').select('*').order('full_name'),
    supabase.from('properties').select('*').order('created_at', { ascending: false }),
    supabase.from('contacts').select('*').in('contact_type', ['seller', 'buyer', 'builder']).order('first_name'),
  ]);

  if (!deal) {
    notFound();
  }

  return (
    <div>
      <Header title={`Edit ${deal.title}`} subtitle="Update deal information" />
      <DealForm
        deal={deal}
        teamMembers={teamMembers || []}
        properties={properties || []}
        contacts={contacts || []}
        currentUserId={user.id}
      />
    </div>
  );
}
