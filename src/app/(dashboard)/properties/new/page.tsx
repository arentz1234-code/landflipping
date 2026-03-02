import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { redirect } from 'next/navigation';

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: teamMembers }, { data: contacts }] = await Promise.all([
    supabase.from('team_members').select('*').order('full_name'),
    supabase.from('contacts').select('*').in('contact_type', ['seller', 'buyer', 'builder']).order('first_name'),
  ]);

  return (
    <div>
      <Header title="Add Property" subtitle="Create a new property" />
      <PropertyForm
        teamMembers={teamMembers || []}
        contacts={contacts || []}
        currentUserId={user.id}
      />
    </div>
  );
}
