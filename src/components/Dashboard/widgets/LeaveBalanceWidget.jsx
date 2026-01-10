import { useUserData } from '../../../hooks/useFirestore';

const LEAVE_TYPES = [
  { id: 'casual', label: 'CL', color: 'bg-blue-500' },
  { id: 'sick', label: 'SL', color: 'bg-rose-500' },
  { id: 'earned', label: 'EL', color: 'bg-emerald-500' },
];

export function LeaveBalanceWidget({ onNavigate }) {
  const [leaveData] = useUserData('leaves', {
    quotas: {
      casual: 12,
      sick: 6,
      earned: 15,
      wfh: 24,
      compOff: 0,
    },
    leaves: [],
  });

  // Calculate used leaves
  const calculateUsed = (type) => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return (leaveData?.leaves || [])
      .filter((leave) => {
        if (leave.type !== type || leave.status === 'cancelled') return false;
        const leaveStart = new Date(leave.startDate);
        return leaveStart >= yearStart && leaveStart <= now;
      })
      .reduce((total, leave) => {
        const days = leave.isHalfDay ? 0.5 :
          Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        return total + days;
      }, 0);
  };

  const getBalance = (type) => {
    const quota = leaveData?.quotas?.[type] || 0;
    const used = calculateUsed(type);
    return Math.max(0, quota - used);
  };

  const totalBalance = LEAVE_TYPES.reduce((sum, type) => sum + getBalance(type.id), 0);

  return (
    <button
      onClick={() => onNavigate('leaves')}
      className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-teal-100">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="px-2 py-1 bg-teal-100 text-teal-600 text-xs font-medium rounded-full">
          {totalBalance} days left
        </span>
      </div>

      <h3 className="font-semibold text-slate-800 mb-3">Leave Balance</h3>

      <div className="flex items-center gap-4">
        {LEAVE_TYPES.map((type) => {
          const balance = getBalance(type.id);
          const quota = leaveData?.quotas?.[type.id] || 0;
          const percentage = quota > 0 ? (balance / quota) * 100 : 0;

          return (
            <div key={type.id} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">{type.label}</span>
                <span className="text-xs font-semibold text-slate-700">{balance}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${type.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Manage leaves</span>
        <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
