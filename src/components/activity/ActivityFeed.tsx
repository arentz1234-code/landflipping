import { ActivityLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Phone, Mail, MessageSquare, Users, MapPin, FileText, RefreshCw, Send } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  text: MessageSquare,
  meeting: Users,
  site_visit: MapPin,
  note: FileText,
  status_change: RefreshCw,
  mailer_sent: Send,
};

const OUTCOME_COLORS: Record<string, string> = {
  interested: 'bg-green-100 text-green-700',
  not_interested: 'bg-red-100 text-red-700',
  no_answer: 'bg-gray-100 text-gray-700',
  left_voicemail: 'bg-yellow-100 text-yellow-700',
  follow_up_needed: 'bg-blue-100 text-blue-700',
};

interface ActivityFeedProps {
  activities: (ActivityLog & { logged_by_member?: { full_name: string } | null })[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No activity logged yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type] || FileText;
        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {activity.activity_type.replace('_', ' ')}
                </span>
                {activity.outcome && (
                  <span className={`text-xs px-2 py-0.5 rounded ${OUTCOME_COLORS[activity.outcome] || 'bg-gray-100 text-gray-700'}`}>
                    {activity.outcome.replace('_', ' ')}
                  </span>
                )}
              </div>
              {activity.subject && (
                <p className="text-sm text-gray-900 mt-1">{activity.subject}</p>
              )}
              {activity.body && (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{activity.body}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{activity.logged_by_member?.full_name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatDateTime(activity.created_at)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
