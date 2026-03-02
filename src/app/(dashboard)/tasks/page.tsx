import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { TaskBoard } from '@/components/tasks/TaskBoard';

const isDevMode = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL;

const mockTasks = [
  { id: '1', title: 'Call seller about Travis property', status: 'todo', priority: 'high', due_date: new Date().toISOString().split('T')[0], assigned_to: 'demo-user', assigned_member: { full_name: 'Demo User' }, deal: { id: '1', title: '10 Acres - Travis County' } },
  { id: '2', title: 'Send offer letter to Hays seller', status: 'todo', priority: 'medium', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], assigned_to: 'demo-user', assigned_member: { full_name: 'Demo User' } },
  { id: '3', title: 'Schedule site visit', status: 'in_progress', priority: 'medium', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], assigned_to: 'demo-user', assigned_member: { full_name: 'Demo User' }, property: { id: '1', address: '1234 Rural Rd', county: 'Travis', state: 'TX' } },
  { id: '4', title: 'Order title search', status: 'todo', priority: 'urgent', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], assigned_to: 'demo-user', assigned_member: { full_name: 'Demo User' }, deal: { id: '5', title: '15 Acres - Bastrop' } },
  { id: '5', title: 'Follow up with builder', status: 'done', priority: 'low', assigned_to: 'demo-user', assigned_member: { full_name: 'Demo User' }, contact: { id: '3', first_name: 'Mike', last_name: 'Johnson' } },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  let tasks: any[] = [];
  let userId = 'demo-user';

  if (isDevMode()) {
    tasks = mockTasks;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    }

    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_member:team_members(full_name),
        deal:deals(id, title),
        property:properties(id, address, county, state),
        contact:contacts(id, first_name, last_name)
      `)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false });

    tasks = data || [];
  }

  const myTasks = tasks.filter((t: any) => t.assigned_to === userId);
  const showAllTasks = params.view === 'all';
  const displayTasks = showAllTasks ? tasks : myTasks;

  const todoTasks = displayTasks.filter((t: any) => t.status === 'todo');
  const inProgressTasks = displayTasks.filter((t: any) => t.status === 'in_progress');
  const doneTasks = displayTasks.filter((t: any) => t.status === 'done');

  return (
    <div>
      <Header
        title="Tasks"
        subtitle={`${todoTasks.length} to do, ${inProgressTasks.length} in progress`}
      />

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/tasks"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showAllTasks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Tasks ({myTasks.length})
        </Link>
        <Link
          href="/tasks?view=all"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showAllTasks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Tasks ({tasks.length})
        </Link>
      </div>

      <TaskBoard
        todoTasks={todoTasks}
        inProgressTasks={inProgressTasks}
        doneTasks={doneTasks}
        showAssignee={showAllTasks}
        userId={userId}
      />
    </div>
  );
}
