import { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useFirestore';

const LEAVE_TYPES = {
  casual: { label: 'Casual Leave', short: 'CL', color: 'bg-blue-100 text-blue-700', defaultQuota: 12 },
  sick: { label: 'Sick Leave', short: 'SL', color: 'bg-rose-100 text-rose-700', defaultQuota: 12 },
  earned: { label: 'Earned Leave', short: 'EL', color: 'bg-emerald-100 text-emerald-700', defaultQuota: 15 },
  wfh: { label: 'Work From Home', short: 'WFH', color: 'bg-purple-100 text-purple-700', defaultQuota: 24 },
  compOff: { label: 'Comp Off', short: 'CO', color: 'bg-amber-100 text-amber-700', defaultQuota: 0 },
  lop: { label: 'Loss of Pay', short: 'LOP', color: 'bg-slate-100 text-slate-600', defaultQuota: Infinity },
};

const LEAVE_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
};

export function LeaveTracker() {
  const [leaveData, setLeaveData, loading] = useUserData('leaves', {
    quotas: {},
    leaves: [],
    year: new Date().getFullYear(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [activeView, setActiveView] = useState('balance');

  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'first', // first or second
  });

  const [quotaForm, setQuotaForm] = useState({});

  const currentYear = new Date().getFullYear();

  // Initialize quotas if not set
  const quotas = useMemo(() => {
    const defaultQuotas = {};
    Object.entries(LEAVE_TYPES).forEach(([key, value]) => {
      defaultQuotas[key] = leaveData?.quotas?.[key] ?? value.defaultQuota;
    });
    return defaultQuotas;
  }, [leaveData?.quotas]);

  // Calculate leave balance
  const leaveBalance = useMemo(() => {
    const balance = {};
    const used = {};

    Object.keys(LEAVE_TYPES).forEach((type) => {
      used[type] = 0;
    });

    // Calculate used leaves (only approved and pending)
    (leaveData?.leaves || []).forEach((leave) => {
      if (leave.status === 'approved' || leave.status === 'pending') {
        const startDate = new Date(leave.startDate);
        if (startDate.getFullYear() === currentYear) {
          used[leave.type] = (used[leave.type] || 0) + leave.days;
        }
      }
    });

    Object.keys(LEAVE_TYPES).forEach((type) => {
      const quota = quotas[type];
      balance[type] = {
        total: quota === Infinity ? '∞' : quota,
        used: used[type] || 0,
        remaining: quota === Infinity ? '∞' : Math.max(0, quota - (used[type] || 0)),
      };
    });

    return balance;
  }, [leaveData?.leaves, quotas, currentYear]);

  // Filter leaves for current year
  const currentYearLeaves = useMemo(() => {
    return (leaveData?.leaves || [])
      .filter((leave) => {
        const startDate = new Date(leave.startDate);
        return startDate.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [leaveData?.leaves, currentYear]);

  const upcomingLeaves = currentYearLeaves.filter(
    (leave) => new Date(leave.startDate) >= new Date() && leave.status !== 'cancelled' && leave.status !== 'rejected'
  );

  const pastLeaves = currentYearLeaves.filter(
    (leave) => new Date(leave.endDate) < new Date() || leave.status === 'cancelled' || leave.status === 'rejected'
  );

  const calculateDays = (start, end, isHalfDay) => {
    if (isHalfDay) return 0.5;
    const startDate = new Date(start);
    const endDate = new Date(end);
    let days = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const resetForm = () => {
    setFormData({
      type: 'casual',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'first',
    });
    setEditingLeave(null);
  };

  const openApplyModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (leave) => {
    setFormData({
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      isHalfDay: leave.isHalfDay || false,
      halfDayPeriod: leave.halfDayPeriod || 'first',
    });
    setEditingLeave(leave);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.startDate || (!formData.isHalfDay && !formData.endDate)) return;

    const endDate = formData.isHalfDay ? formData.startDate : formData.endDate;
    const days = calculateDays(formData.startDate, endDate, formData.isHalfDay);

    const leaveEntry = {
      ...formData,
      endDate,
      days,
      status: 'approved', // Auto-approve for personal tracking
      appliedOn: new Date().toISOString(),
    };

    if (editingLeave) {
      const updatedLeaves = leaveData.leaves.map((leave) =>
        leave.id === editingLeave.id ? { ...leave, ...leaveEntry } : leave
      );
      setLeaveData({ ...leaveData, leaves: updatedLeaves });
    } else {
      const newLeave = {
        id: Date.now().toString(),
        ...leaveEntry,
      };
      setLeaveData({
        ...leaveData,
        leaves: [...(leaveData.leaves || []), newLeave],
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleCancel = (leaveId) => {
    const updatedLeaves = leaveData.leaves.map((leave) =>
      leave.id === leaveId ? { ...leave, status: 'cancelled' } : leave
    );
    setLeaveData({ ...leaveData, leaves: updatedLeaves });
  };

  const handleDelete = (leaveId) => {
    if (!confirm('Are you sure you want to delete this leave record?')) return;
    const updatedLeaves = leaveData.leaves.filter((leave) => leave.id !== leaveId);
    setLeaveData({ ...leaveData, leaves: updatedLeaves });
  };

  const saveQuotas = () => {
    setLeaveData({
      ...leaveData,
      quotas: quotaForm,
    });
    setIsSettingsOpen(false);
  };

  const openSettings = () => {
    setQuotaForm({ ...quotas });
    setIsSettingsOpen(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (start, end, isHalfDay, halfDayPeriod) => {
    if (isHalfDay) {
      return `${formatDate(start)} (${halfDayPeriod === 'first' ? 'First' : 'Second'} Half)`;
    }
    if (start === end) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60">Loading leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(LEAVE_TYPES).map(([key, type]) => {
          const balance = leaveBalance[key];
          const percentage = type.defaultQuota === Infinity ? 0 :
            balance.total === '∞' ? 0 : ((balance.used / balance.total) * 100);

          return (
            <div key={key} className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${type.color}`}>
                  {type.short}
                </span>
                <span className="text-xs text-slate-400">{currentYear}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {balance.remaining}
                <span className="text-sm font-normal text-slate-400">/{balance.total}</span>
              </div>
              <div className="text-xs text-slate-500">{type.label}</div>
              {balance.total !== '∞' && (
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage > 80 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Leave Tracker</h2>
              <p className="text-slate-400 text-sm mt-1">Manage your leaves for {currentYear}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openSettings}
                className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={openApplyModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply Leave
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mt-4 inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveView('balance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'balance'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveView('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'upcoming'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upcoming ({upcomingLeaves.length})
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'history'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              History ({pastLeaves.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'balance' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {Object.values(leaveBalance).reduce((sum, b) => sum + (typeof b.remaining === 'number' ? b.remaining : 0), 0)}
                      </div>
                      <div className="text-xs text-emerald-600">Total Remaining</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {Object.values(leaveBalance).reduce((sum, b) => sum + b.used, 0)}
                      </div>
                      <div className="text-xs text-blue-600">Days Taken</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{upcomingLeaves.length}</div>
                      <div className="text-xs text-purple-600">Upcoming Leaves</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Type Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Leave Balance Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(LEAVE_TYPES).map(([key, type]) => {
                    const balance = leaveBalance[key];
                    const percentage = type.defaultQuota === Infinity ? 0 :
                      balance.total === '∞' ? 0 : ((balance.used / balance.total) * 100);

                    return (
                      <div key={key} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${type.color}`}>
                          {type.short}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{type.label}</span>
                            <span className="text-sm text-slate-500">
                              {balance.used} used / {balance.total} total
                            </span>
                          </div>
                          {balance.total !== '∞' && (
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percentage > 80 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-lg font-bold text-slate-800 w-12 text-right">
                          {balance.remaining}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(activeView === 'upcoming' || activeView === 'history') && (
            <div>
              {(activeView === 'upcoming' ? upcomingLeaves : pastLeaves).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    No {activeView === 'upcoming' ? 'upcoming' : 'past'} leaves
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {activeView === 'upcoming' ? 'Apply for a leave to see it here' : 'Your leave history will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(activeView === 'upcoming' ? upcomingLeaves : pastLeaves).map((leave) => {
                    const type = LEAVE_TYPES[leave.type];
                    const status = LEAVE_STATUS[leave.status];

                    return (
                      <div
                        key={leave.id}
                        className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center text-white shadow-lg shadow-violet-500/20">
                          <span className="text-xs font-medium">
                            {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {new Date(leave.startDate).getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${type.color}`}>
                              {type.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {leave.days} {leave.days === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {formatDateRange(leave.startDate, leave.endDate, leave.isHalfDay, leave.halfDayPeriod)}
                          </p>
                          {leave.reason && (
                            <p className="text-xs text-slate-400 truncate">{leave.reason}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {leave.status !== 'cancelled' && activeView === 'upcoming' && (
                            <>
                              <button
                                onClick={() => openEditModal(leave)}
                                className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleCancel(leave.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(leave.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingLeave ? 'Edit Leave' : 'Apply for Leave'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LEAVE_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: key })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                        formData.type === key
                          ? type.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="font-semibold">{type.short}</span>
                      <span className="text-xs ml-1 opacity-75">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-700">Half Day</span>
                </label>
                {formData.isHalfDay && (
                  <select
                    value={formData.halfDayPeriod}
                    onChange={(e) => setFormData({ ...formData, halfDayPeriod: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  >
                    <option value="first">First Half</option>
                    <option value="second">Second Half</option>
                  </select>
                )}
              </div>

              <div className={formData.isHalfDay ? '' : 'grid grid-cols-2 gap-4'}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.isHalfDay ? 'Date' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  />
                </div>
                {!formData.isHalfDay && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                      required
                    />
                  </div>
                )}
              </div>

              {formData.startDate && (formData.isHalfDay || formData.endDate) && (
                <div className="p-3 bg-violet-50 rounded-xl">
                  <span className="text-sm text-violet-700">
                    Duration: <strong>{calculateDays(formData.startDate, formData.isHalfDay ? formData.startDate : formData.endDate, formData.isHalfDay)} day(s)</strong>
                    {formData.type !== 'lop' && (
                      <span className="text-violet-500 ml-2">
                        (Balance: {leaveBalance[formData.type].remaining})
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                >
                  {editingLeave ? 'Update' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Leave Quota Settings</h3>
              <p className="text-sm text-slate-400 mt-1">Set your annual leave quotas for {currentYear}</p>
            </div>

            <div className="p-6 space-y-4">
              {Object.entries(LEAVE_TYPES).map(([key, type]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${type.color} w-24`}>
                    {type.label}
                  </span>
                  <input
                    type="number"
                    value={quotaForm[key] === Infinity ? '' : quotaForm[key] || ''}
                    onChange={(e) => setQuotaForm({
                      ...quotaForm,
                      [key]: e.target.value === '' ? (key === 'lop' ? Infinity : 0) : parseInt(e.target.value)
                    })}
                    placeholder={key === 'lop' ? 'Unlimited' : '0'}
                    min="0"
                    disabled={key === 'lop'}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <span className="text-sm text-slate-400 w-12">days</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveQuotas}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
              >
                Save Quotas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
