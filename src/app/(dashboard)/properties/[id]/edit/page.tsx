import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditPropertyPage({
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

  const [{ data: property }, { data: teamMembers }, { data: contacts }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('team_members').select('*').order('full_name'),
    supabase.from('contacts').select('*').in('contact_type', ['seller', 'buyer', 'builder']).order('first_name'),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div>
      <Header
        title={`Edit ${property.address || property.county + ', ' + property.state}`}
        subtitle="Update property information"
      />
      <PropertyForm
        property={property}
        teamMembers={teamMembers || []}
        contacts={contacts || []}
        currentUserId={user.id}
      />
    </div>
  );
}
