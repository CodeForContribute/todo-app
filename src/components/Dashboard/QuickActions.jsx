import { useAttendance } from '../../hooks/useFirestore';
import { formatDateKey } from '../../utils/dateUtils';

export function QuickActions({ onNavigate }) {
  const [attendance] = useAttendance();
  const today = formatDateKey(new Date());
  const todayAttendance = attendance[today];
  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const hasCheckedOut = todayAttendance?.checkOut;

  const actions = [
    {
      id: 'checkin',
      label: hasCheckedOut ? 'Checked Out' : isCheckedIn ? 'Checked In' : 'Check In',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: hasCheckedOut ? 'bg-slate-100 text-slate-400' : isCheckedIn ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600',
      onClick: () => onNavigate('attendance'),
      disabled: hasCheckedOut,
    },
    {
      id: 'task',
      label: 'Add Task',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      onClick: () => onNavigate('tasks'),
    },
    {
      id: 'focus',
      label: 'Start Focus',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-amber-100 text-amber-600',
      onClick: () => onNavigate('focus'),
    },
    {
      id: 'note',
      label: 'Quick Note',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-rose-100 text-rose-600',
      onClick: () => onNavigate('notes'),
    },
  ];

  return (
    <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="font-semibold text-slate-700">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200
              ${action.color}
              ${action.disabled
                ? 'cursor-not-allowed opacity-60'
                : 'hover:scale-105 hover:shadow-md active:scale-95'
              }
            `}
          >
            <div className="p-2 rounded-xl bg-white/50">
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
