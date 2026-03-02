import { Header } from '@/components/layout/Header';
import { BuilderForm } from '@/components/contacts/BuilderForm';

export default function NewBuilderPage() {
  return (
    <div>
      <Header title="Add Builder" subtitle="Create a new builder contact" />
      <BuilderForm />
    </div>
  );
}
