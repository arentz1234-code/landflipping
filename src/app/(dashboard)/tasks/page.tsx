import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { TaskBoard } from '@/components/tasks/TaskBoard';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '';

  const { data: tasks } = await supabase
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

  const allTasks = tasks || [];
  const myTasks = allTasks.filter((t: any) => t.assigned_to === userId);
  const showAllTasks = params.view === 'all';
  const displayTasks = showAllTasks ? allTasks : myTasks;

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
          All Tasks ({allTasks.length})
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
