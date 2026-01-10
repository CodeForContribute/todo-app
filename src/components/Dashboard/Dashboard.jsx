import { useAuth } from '../../contexts/AuthContext';
import { QuickActions } from './QuickActions';
import { AttendanceWidget } from './widgets/AttendanceWidget';
import { TasksWidget } from './widgets/TasksWidget';
import { FocusWidget } from './widgets/FocusWidget';
import { MeetingsWidget } from './widgets/MeetingsWidget';
import { LeaveBalanceWidget } from './widgets/LeaveBalanceWidget';
import { DailyQuote } from '../DailyQuote';
import { StreakDisplay } from '../Gamification/StreakDisplay';

export function Dashboard({ onNavigate }) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.displayName?.split(' ')[0] || 'User';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Greeting and Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-white/60">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <StreakDisplay />
      </div>

      {/* Quick Actions */}
      <QuickActions onNavigate={onNavigate} />

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AttendanceWidget onNavigate={onNavigate} />
        <TasksWidget onNavigate={onNavigate} />
        <FocusWidget onNavigate={onNavigate} />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MeetingsWidget onNavigate={onNavigate} />
        <LeaveBalanceWidget onNavigate={onNavigate} />
      </div>

      {/* Daily Quote */}
      <DailyQuote />
    </div>
  );
}
