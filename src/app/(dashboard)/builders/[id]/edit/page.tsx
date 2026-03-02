import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { BuilderForm } from '@/components/contacts/BuilderForm';
import { notFound } from 'next/navigation';

export default async function EditBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: builder } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('contact_type', 'builder')
    .single();

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
