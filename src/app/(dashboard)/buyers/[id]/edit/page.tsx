import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { BuyerForm } from '@/components/contacts/BuyerForm';
import { notFound } from 'next/navigation';

export default async function EditBuyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: buyer } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('contact_type', 'buyer')
    .single();

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
