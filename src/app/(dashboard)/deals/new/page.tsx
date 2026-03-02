import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { DealForm } from '@/components/deals/DealForm';
import { redirect } from 'next/navigation';

export default async function NewDealPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: teamMembers }, { data: properties }, { data: contacts }] = await Promise.all([
    supabase.from('team_members').select('*').order('full_name'),
    supabase.from('properties').select('*').order('created_at', { ascending: false }),
    supabase.from('contacts').select('*').in('contact_type', ['seller', 'buyer', 'builder']).order('first_name'),
  ]);

  return (
    <div>
      <Header title="New Deal" subtitle="Create a new deal" />
      <DealForm
        teamMembers={teamMembers || []}
        properties={properties || []}
        contacts={contacts || []}
        currentUserId={user.id}
      />
    </div>
  );
}
