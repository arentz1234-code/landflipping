import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { ContactForm } from '@/components/contacts/ContactForm';
import { redirect } from 'next/navigation';

export default async function NewContactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .order('full_name');

  return (
    <div>
      <Header title="Add Contact" subtitle="Create a new contact" />
      <ContactForm teamMembers={teamMembers || []} currentUserId={user.id} />
    </div>
  );
}
