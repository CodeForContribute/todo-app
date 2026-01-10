import { useTodos } from '../../../hooks/useFirestore';
import { formatDateKey } from '../../../utils/dateUtils';

export function TasksWidget({ onNavigate }) {
  const [todos] = useTodos();
  const today = formatDateKey(new Date());
  const todayTodos = todos[today] || [];

  const completed = todayTodos.filter((t) => t.completed).length;
  const total = todayTodos.length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  // Calculate task streak
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const key = formatDateKey(checkDate);
    const dayTodos = todos[key] || [];
    const dayCompleted = dayTodos.filter((t) => t.completed).length;
    if (dayCompleted > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (key !== today) {
      break;
    } else {
      break;
    }
    if (streak > 365) break;
  }

  return (
    <button
      onClick={() => onNavigate('tasks')}
      className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${pending === 0 && total > 0 ? 'bg-emerald-100' : 'bg-blue-100'}`}>
          <svg
            className={`w-6 h-6 ${pending === 0 && total > 0 ? 'text-emerald-600' : 'text-blue-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-orange-600">{streak}</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">Today's Tasks</h3>
      <p className="text-sm text-slate-500 mb-3">
        {total === 0
          ? 'No tasks yet'
          : pending === 0
            ? 'All done!'
            : `${pending} pending`
        }
      </p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="font-medium text-slate-600">{completed}/{total}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">View all tasks</span>
        <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
