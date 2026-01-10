import { useUserData } from '../../../hooks/useFirestore';

export function FocusWidget({ onNavigate }) {
  const [stats] = useUserData('pomodoroStats', {
    totalSessions: 0,
    totalFocusTime: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    lastSessionDate: null,
  });

  // Check if stats are from today
  const today = new Date().toDateString();
  const isToday = stats?.lastSessionDate && new Date(stats.lastSessionDate).toDateString() === today;
  const todaySessions = isToday ? stats?.todaySessions || 0 : 0;
  const todayMinutes = isToday ? Math.round((stats?.todayFocusTime || 0) / 60) : 0;

  // Calculate streak (simplified - based on consecutive days with sessions)
  const streak = stats?.focusStreak || 0;

  return (
    <button
      onClick={() => onNavigate('focus')}
      className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-amber-100">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-orange-600">{streak}</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">Focus Timer</h3>
      <p className="text-sm text-slate-500 mb-3">
        {todaySessions === 0
          ? 'No sessions today'
          : `${todaySessions} session${todaySessions > 1 ? 's' : ''} today`
        }
      </p>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-slate-400">Today: </span>
          <span className="text-slate-600 font-medium">{todayMinutes} min</span>
        </div>
        <div>
          <span className="text-slate-400">Total: </span>
          <span className="text-slate-600 font-medium">
            {Math.round((stats?.totalFocusTime || 0) / 3600)}h
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Start focusing</span>
        <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
