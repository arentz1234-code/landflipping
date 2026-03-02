import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ContactForm } from '@/components/contacts/ContactForm';
import { notFound, redirect } from 'next/navigation';

export default async function EditContactPage({
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

  const [{ data: contact }, { data: teamMembers }] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase.from('team_members').select('*').order('full_name'),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div>
      <Header
        title={`Edit ${contact.first_name} ${contact.last_name}`}
        subtitle="Update contact information"
      />
      <ContactForm
        contact={contact}
        teamMembers={teamMembers || []}
        currentUserId={user.id}
      />
    </div>
  );
}
