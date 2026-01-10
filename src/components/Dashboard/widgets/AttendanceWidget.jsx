import { useAttendance } from '../../../hooks/useFirestore';
import { formatDateKey } from '../../../utils/dateUtils';

export function AttendanceWidget({ onNavigate }) {
  const [attendance] = useAttendance();
  const today = formatDateKey(new Date());
  const todayAttendance = attendance[today];

  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const hasCheckedOut = todayAttendance?.checkOut;

  // Calculate working hours
  let workingHours = 0;
  if (todayAttendance?.checkIn) {
    const checkIn = new Date(todayAttendance.checkIn);
    const checkOut = todayAttendance.checkOut
      ? new Date(todayAttendance.checkOut)
      : new Date();
    workingHours = (checkOut - checkIn) / (1000 * 60 * 60);
  }

  // Calculate streak
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const key = formatDateKey(checkDate);
    if (attendance[key]?.checkIn) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (key !== today) {
      break;
    } else {
      break;
    }
    if (streak > 365) break; // Safety limit
  }

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <button
      onClick={() => onNavigate('attendance')}
      className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`
          p-3 rounded-xl
          ${hasCheckedOut
            ? 'bg-slate-100'
            : isCheckedIn
              ? 'bg-emerald-100'
              : 'bg-amber-100'
          }
        `}>
          <svg
            className={`w-6 h-6 ${
              hasCheckedOut
                ? 'text-slate-500'
                : isCheckedIn
                  ? 'text-emerald-600'
                  : 'text-amber-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-orange-600">{streak}</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">Attendance</h3>
      <p className={`text-sm font-medium mb-3 ${
        hasCheckedOut
          ? 'text-slate-500'
          : isCheckedIn
            ? 'text-emerald-600'
            : 'text-amber-600'
      }`}>
        {hasCheckedOut ? 'Checked Out' : isCheckedIn ? 'Working' : 'Not Checked In'}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-slate-400">In: </span>
          <span className="text-slate-600 font-medium">{formatTime(todayAttendance?.checkIn)}</span>
        </div>
        <div>
          <span className="text-slate-400">Hours: </span>
          <span className="text-slate-600 font-medium">{workingHours.toFixed(1)}h</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">View details</span>
        <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
