import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Plus, Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT_TYPE_COLORS, CONTACT_TYPE_LABELS, formatCurrency, contactFullName } from '@/lib/utils';
import { ContactType } from '@/lib/types';
import { ContactFilters } from '@/components/contacts/ContactFilters';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockContacts = [
  { id: '1', contact_type: 'buyer', first_name: 'John', last_name: 'Smith', company_name: 'Smith Builders', email: 'john@smith.com', phone: '512-555-0101', city: 'Austin', state: 'TX', counties_of_interest: ['Travis', 'Williamson'], min_acreage: 5, max_acreage: 20, max_total_budget: 500000, status: 'active', assigned_member: { full_name: 'Demo User' } },
  { id: '2', contact_type: 'seller', first_name: 'Jane', last_name: 'Doe', email: 'jane@email.com', phone: '512-555-0102', city: 'Round Rock', state: 'TX', motivation_level: 8, status: 'active', assigned_member: { full_name: 'Demo User' } },
  { id: '3', contact_type: 'builder', first_name: 'Mike', last_name: 'Johnson', company_name: 'MJ Custom Homes', phone: '512-555-0103', city: 'Cedar Park', state: 'TX', counties_of_interest: ['Travis'], min_acreage: 0.25, max_acreage: 2, max_total_budget: 150000, status: 'active', assigned_member: { full_name: 'Demo User' } },
];

const mockTeamMembers = [{ id: 'demo-user', full_name: 'Demo User' }];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; assigned_to?: string; search?: string }>;
}) {
  const params = await searchParams;

  let contacts: any[] = [];
  let teamMembers: any[] = [];

  if (isDevMode()) {
    contacts = mockContacts;
    teamMembers = mockTeamMembers;
  } else {
    const supabase = await createClient();

    let query = supabase
      .from('contacts')
      .select('*, assigned_member:team_members(full_name)')
      .order('created_at', { ascending: false });

    if (params.type) {
      query = query.eq('contact_type', params.type);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.assigned_to) {
      query = query.eq('assigned_to', params.assigned_to);
    }
    if (params.search) {
      query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
    }

    const { data: c } = await query;
    const { data: t } = await supabase.from('team_members').select('id, full_name');
    contacts = c || [];
    teamMembers = t || [];
  }

  return (
    <div>
      <Header
        title="Contacts"
        subtitle={`${contacts?.length || 0} contacts`}
        actions={
          <Link href="/contacts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        }
      />

      <ContactFilters teamMembers={teamMembers || []} />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Criteria
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {contactFullName(contact)}
                      </Link>
                      {contact.company_name && (
                        <p className="text-xs text-gray-500">{contact.company_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={CONTACT_TYPE_COLORS[contact.contact_type as ContactType]}>
                        {CONTACT_TYPE_LABELS[contact.contact_type as ContactType]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(contact.city || contact.state) && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {[contact.city, contact.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {contact.counties_of_interest && contact.counties_of_interest.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Counties: {contact.counties_of_interest.slice(0, 3).join(', ')}
                          {contact.counties_of_interest.length > 3 && '...'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(contact.contact_type === 'buyer' || contact.contact_type === 'builder') && (
                        <div className="text-sm text-gray-600">
                          {contact.min_acreage || contact.max_acreage ? (
                            <p>{contact.min_acreage || 0} - {contact.max_acreage || '∞'} ac</p>
                          ) : null}
                          {contact.max_total_budget && (
                            <p className="text-xs text-gray-500">
                              Budget: {formatCurrency(contact.max_total_budget)}
                            </p>
                          )}
                        </div>
                      )}
                      {contact.contact_type === 'seller' && contact.motivation_level && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${contact.motivation_level * 10}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{contact.motivation_level}/10</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {contact.assigned_member?.full_name || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No contacts found. <Link href="/contacts/new" className="text-blue-600 hover:underline">Add your first contact</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
