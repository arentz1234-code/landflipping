'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Task, TaskStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { formatDate, daysUntil, PRIORITY_COLORS } from '@/lib/utils';
import { Check, Circle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskWithRelations extends Omit<Task, 'deal' | 'property' | 'contact' | 'assigned_member'> {
  assigned_member?: { full_name: string } | null;
  deal?: { id: string; title: string } | null;
  property?: { id: string; address: string | null; county: string; state: string } | null;
  contact?: { id: string; first_name: string; last_name: string } | null;
}

interface TaskBoardProps {
  todoTasks: TaskWithRelations[];
  inProgressTasks: TaskWithRelations[];
  doneTasks: TaskWithRelations[];
  showAssignee: boolean;
  userId: string;
}

export function TaskBoard({ todoTasks, inProgressTasks, doneTasks, showAssignee, userId }: TaskBoardProps) {
  const router = useRouter();
  const supabase = createClient();

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const update: { status: TaskStatus; completed_at?: string | null } = { status: newStatus };
      if (newStatus === 'done') {
        update.completed_at = new Date().toISOString();
      } else {
        update.completed_at = null;
      }

      const { error } = await supabase.from('tasks').update(update).eq('id', taskId);
      if (error) throw error;
      router.refresh();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const TaskCard = ({ task }: { task: TaskWithRelations }) => {
    const days = daysUntil(task.due_date);
    const isOverdue = days !== null && days < 0 && task.status !== 'done';
    const isDueToday = days === 0;

    const linkedEntity = task.deal
      ? { type: 'Deal', name: task.deal.title, href: `/deals/${task.deal.id}` }
      : task.property
      ? { type: 'Property', name: task.property.address || `${task.property.county}, ${task.property.state}`, href: `/properties/${task.property.id}` }
      : task.contact
      ? { type: 'Contact', name: `${task.contact.first_name} ${task.contact.last_name}`, href: `/contacts/${task.contact.id}` }
      : null;

    return (
      <div className={`bg-white rounded-lg p-3 shadow-sm border ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.status === 'done'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            {task.status === 'done' && <Check className="w-3 h-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {task.title}
            </p>

            {linkedEntity && (
              <Link href={linkedEntity.href} className="text-xs text-blue-600 hover:underline">
                {linkedEntity.type}: {linkedEntity.name}
              </Link>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {task.priority}
              </Badge>
              {task.due_date && (
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600' : 'text-gray-500'}`}>
                  {isOverdue ? `${Math.abs(days!)} days overdue` : isDueToday ? 'Due today' : formatDate(task.due_date)}
                </span>
              )}
              {showAssignee && task.assigned_member && (
                <span className="text-xs text-gray-500">
                  {task.assigned_member.full_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Column = ({
    title,
    tasks,
    status,
    icon: Icon,
    color,
  }: {
    title: string;
    tasks: TaskWithRelations[];
    status: TaskStatus;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <div className="flex-1 min-w-[300px]">
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">({tasks.length})</span>
      </div>
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      <Column
        title="To Do"
        tasks={todoTasks}
        status="todo"
        icon={Circle}
        color="border-gray-300"
      />
      <Column
        title="In Progress"
        tasks={inProgressTasks}
        status="in_progress"
        icon={Clock}
        color="border-blue-500"
      />
      <Column
        title="Done"
        tasks={doneTasks}
        status="done"
        icon={Check}
        color="border-green-500"
      />
    </div>
  );
}
