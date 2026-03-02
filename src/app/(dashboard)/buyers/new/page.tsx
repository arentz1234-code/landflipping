import { Header } from '@/components/layout/Header';
import { BuyerForm } from '@/components/contacts/BuyerForm';

export default function NewBuyerPage() {
  return (
    <div>
      <Header title="Add Buyer" subtitle="Create a new buyer contact" />
      <BuyerForm />
    </div>
  );
}
