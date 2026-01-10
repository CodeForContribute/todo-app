import { useState, useEffect } from 'react';
import { useAttendance, useOfficeConfig } from '../hooks/useFirestore';
import { formatDateKey, formatDisplayDate, MONTH_NAMES } from '../utils/dateUtils';
import {
  getWeekDates,
  getMonthDates,
  getYearData,
  isWeekend,
  isToday,
  isFutureDate,
  formatTime,
  calculateWorkingHours,
  getAttendanceStats,
  DAY_NAMES,
  MONTH_NAMES_SHORT
} from '../utils/attendanceUtils';
import {
  getCurrentIP,
  getCurrentLocation,
  isOfficeNetwork,
  isAtOfficeLocation
} from '../utils/networkUtils';
import { OfficeSettings } from './OfficeSettings';

export function AttendanceTracker() {
  const [attendance, setAttendance] = useAttendance();
  const [officeConfig, setOfficeConfig] = useOfficeConfig();
  const [activeView, setActiveView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    checking: true,
    isOffice: false,
    currentIP: null,
    currentLocation: null,
    autoCheckedIn: false
  });

  const todayKey = formatDateKey(new Date());
  const todayRecord = attendance[todayKey];

  // Auto check-in on mount and when config changes
  useEffect(() => {
    if (!officeConfig?.enabled || isWeekend(new Date())) {
      setNetworkStatus(prev => ({ ...prev, checking: false }));
      return;
    }

    const checkNetwork = async () => {
      setNetworkStatus(prev => ({ ...prev, checking: true }));

      try {
        let isOffice = false;
        let currentIP = null;
        let currentLocation = null;

        if (officeConfig.method === 'ip') {
          currentIP = await getCurrentIP();
          isOffice = isOfficeNetwork(currentIP, officeConfig);
        } else if (officeConfig.method === 'location') {
          try {
            currentLocation = await getCurrentLocation();
            isOffice = isAtOfficeLocation(currentLocation, officeConfig);
          } catch (e) {
            console.log('Location access denied');
          }
        }

        // Auto check-in if at office and not already checked in today
        if (isOffice && !todayRecord?.checkIn) {
          const now = new Date();
          setAttendance(prev => ({
            ...prev,
            [todayKey]: {
              status: 'present',
              checkIn: now.toISOString(),
              checkOut: null,
              auto: true
            }
          }));
          setNetworkStatus({
            checking: false,
            isOffice: true,
            currentIP,
            currentLocation,
            autoCheckedIn: true
          });
        } else {
          setNetworkStatus({
            checking: false,
            isOffice,
            currentIP,
            currentLocation,
            autoCheckedIn: false
          });
        }
      } catch (error) {
        console.error('Network check failed:', error);
        setNetworkStatus(prev => ({ ...prev, checking: false }));
      }
    };

    checkNetwork();

    // Re-check every 5 minutes
    const interval = setInterval(checkNetwork, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [officeConfig, todayKey]);

  const handleCheckIn = () => {
    const now = new Date();
    setAttendance({
      ...attendance,
      [todayKey]: {
        status: 'present',
        checkIn: now.toISOString(),
        checkOut: null
      }
    });
  };

  const handleCheckOut = () => {
    if (todayRecord?.checkIn) {
      setAttendance({
        ...attendance,
        [todayKey]: {
          ...todayRecord,
          checkOut: new Date().toISOString()
        }
      });
    }
  };

  const togglePastAttendance = (date) => {
    if (isFutureDate(date) || isWeekend(date)) return;

    const key = formatDateKey(date);
    const current = attendance[key];

    if (current?.status === 'present') {
      const { [key]: _, ...rest } = attendance;
      setAttendance(rest);
    } else {
      setAttendance({
        ...attendance,
        [key]: {
          status: 'present',
          checkIn: null,
          checkOut: null,
          manual: true
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto Check-in Status Banner */}
      {networkStatus.autoCheckedIn && (
        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10 animate-fade-in border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-emerald-800">Auto Check-in Successful!</div>
              <div className="text-sm text-emerald-600">
                Office network detected - you've been automatically checked in
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Check-in Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {formatDisplayDate(new Date())}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {todayRecord?.status === 'present'
                  ? todayRecord.auto
                    ? 'Auto checked in via office network'
                    : 'You are checked in today'
                  : 'Mark your attendance for today'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isWeekend(new Date()) && (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  Weekend
                </span>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                title="Configure auto check-in"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Network Status Indicator */}
          {officeConfig?.enabled && !isWeekend(new Date()) && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                networkStatus.checking
                  ? 'bg-amber-400 animate-pulse'
                  : networkStatus.isOffice
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
              }`} />
              <span className="text-sm text-slate-600">
                {networkStatus.checking
                  ? 'Checking network...'
                  : networkStatus.isOffice
                    ? `Connected to office network${networkStatus.currentIP ? ` (${networkStatus.currentIP})` : ''}`
                    : 'Not on office network'
                }
              </span>
            </div>
          )}

          {/* Setup Prompt if not configured */}
          {!officeConfig?.enabled && !isWeekend(new Date()) && (
            <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-medium text-violet-800">Enable Auto Check-in</div>
                  <p className="text-xs text-violet-600 mt-1">
                    Configure your office network to automatically check in when connected.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-2 px-3 py-1.5 text-xs font-medium text-violet-600 bg-white rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    Configure Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isWeekend(new Date()) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Check In */}
              <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">Check In</span>
                  {todayRecord?.checkIn && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {todayRecord.auto ? 'Auto' : 'Manual'}
                    </span>
                  )}
                </div>
                {todayRecord?.checkIn ? (
                  <div className="text-2xl font-bold text-slate-800">
                    {formatTime(new Date(todayRecord.checkIn))}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Check In Now
                  </button>
                )}
              </div>

              {/* Check Out */}
              <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">Check Out</span>
                  {todayRecord?.checkOut && (
                    <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                      Recorded
                    </span>
                  )}
                </div>
                {todayRecord?.checkOut ? (
                  <div className="text-2xl font-bold text-slate-800">
                    {formatTime(new Date(todayRecord.checkOut))}
                  </div>
                ) : todayRecord?.checkIn ? (
                  <button
                    onClick={handleCheckOut}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Check Out Now
                  </button>
                ) : (
                  <div className="text-slate-400 text-sm py-3 text-center">
                    Check in first
                  </div>
                )}
              </div>

              {/* Working Hours */}
              {todayRecord?.checkIn && todayRecord?.checkOut && (
                <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <div className="text-sm font-medium text-violet-500 mb-3">Today's Hours</div>
                  <div className="text-2xl font-bold text-violet-700">
                    {(() => {
                      const hours = calculateWorkingHours(todayRecord.checkIn, todayRecord.checkOut);
                      return hours ? `${hours.hours}h ${hours.minutes}m` : '-';
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl">
        {[
          { id: 'week', label: 'Week' },
          { id: 'month', label: 'Month' },
          { id: 'year', label: 'Year' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeView === tab.id
                ? 'bg-white text-slate-800 shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {activeView === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendance={attendance}
          onToggle={togglePastAttendance}
        />
      )}
      {activeView === 'month' && (
        <MonthView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendance={attendance}
          onToggle={togglePastAttendance}
        />
      )}
      {activeView === 'year' && (
        <YearView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendance={attendance}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <OfficeSettings
          config={officeConfig}
          onSave={setOfficeConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function WeekView({ selectedDate, onDateChange, attendance, onToggle }) {
  const weekDates = getWeekDates(selectedDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const stats = getAttendanceStats(attendance, weekStart, weekEnd);

  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  return (
    <div className="glass rounded-2xl shadow-xl shadow-purple-900/10 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-semibold text-slate-800">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button
          onClick={nextWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDates.map((date, idx) => {
          const key = formatDateKey(date);
          const record = attendance[key];
          const weekend = isWeekend(date);
          const today = isToday(date);
          const future = isFutureDate(date);
          const present = record?.status === 'present';

          return (
            <button
              key={idx}
              onClick={() => !future && !weekend && onToggle(date)}
              disabled={future || weekend}
              className={`
                p-3 rounded-xl text-center transition-all duration-200
                ${weekend ? 'bg-slate-50 cursor-default' : ''}
                ${today && !weekend ? 'ring-2 ring-violet-400 ring-offset-2' : ''}
                ${present && !weekend ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : ''}
                ${!present && !weekend && !future ? 'bg-slate-100 hover:bg-slate-200 cursor-pointer' : ''}
                ${future && !weekend ? 'bg-slate-50 text-slate-300 cursor-default' : ''}
              `}
            >
              <div className={`text-xs font-medium mb-1 ${present ? 'text-white/80' : weekend ? 'text-slate-400' : 'text-slate-500'}`}>
                {DAY_NAMES[date.getDay()]}
              </div>
              <div className={`text-lg font-bold ${present ? 'text-white' : weekend ? 'text-slate-400' : future ? 'text-slate-300' : 'text-slate-700'}`}>
                {date.getDate()}
              </div>
              {present && !weekend && (
                <div className="mt-1">
                  <svg className="w-4 h-4 mx-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
          <div className="text-xs text-slate-400 font-medium">Present</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-rose-500">{stats.absent}</div>
          <div className="text-xs text-slate-400 font-medium">Absent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-600">{stats.percentage}%</div>
          <div className="text-xs text-slate-400 font-medium">Attendance</div>
        </div>
      </div>
    </div>
  );
}

function MonthView({ selectedDate, onDateChange, attendance, onToggle }) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthDates = getMonthDates(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const stats = getAttendanceStats(attendance, monthStart, monthEnd);

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  return (
    <div className="glass rounded-2xl shadow-xl shadow-purple-900/10 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-semibold text-slate-800 text-lg">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day, idx) => (
          <div key={idx} className="text-center text-xs font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-10" />
        ))}

        {/* Date cells */}
        {monthDates.map((date, idx) => {
          const key = formatDateKey(date);
          const record = attendance[key];
          const weekend = isWeekend(date);
          const today = isToday(date);
          const future = isFutureDate(date);
          const present = record?.status === 'present';

          return (
            <button
              key={idx}
              onClick={() => !future && !weekend && onToggle(date)}
              disabled={future || weekend}
              className={`
                h-10 w-full rounded-lg text-sm font-medium transition-all duration-200 relative
                ${weekend ? 'text-slate-300 cursor-default' : ''}
                ${today ? 'ring-2 ring-violet-400' : ''}
                ${present && !weekend ? 'bg-emerald-500 text-white' : ''}
                ${!present && !weekend && !future ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : ''}
                ${future && !weekend ? 'text-slate-300 cursor-default' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
        <div className="text-center p-3 rounded-xl bg-emerald-50">
          <div className="text-xl font-bold text-emerald-600">{stats.present}</div>
          <div className="text-xs text-emerald-500 font-medium">Present</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-rose-50">
          <div className="text-xl font-bold text-rose-500">{stats.absent}</div>
          <div className="text-xs text-rose-400 font-medium">Absent</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-violet-50">
          <div className="text-xl font-bold text-violet-600">{stats.percentage}%</div>
          <div className="text-xs text-violet-400 font-medium">Rate</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50">
          <div className="text-xl font-bold text-slate-600">{stats.workingDays}</div>
          <div className="text-xs text-slate-400 font-medium">Work Days</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200"></span>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-2 ring-violet-400"></span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

function YearView({ selectedDate, onDateChange, attendance }) {
  const year = selectedDate.getFullYear();
  const yearData = getYearData(year, attendance);

  const totalPresent = yearData.reduce((sum, m) => sum + m.present, 0);
  const totalWorkingDays = yearData.reduce((sum, m) => sum + m.workingDays, 0);
  const yearPercentage = totalWorkingDays > 0 ? Math.round((totalPresent / totalWorkingDays) * 100) : 0;

  const prevYear = () => {
    onDateChange(new Date(year - 1, 0, 1));
  };

  const nextYear = () => {
    onDateChange(new Date(year + 1, 0, 1));
  };

  const getColor = (percentage) => {
    if (percentage >= 90) return 'from-emerald-400 to-teal-500';
    if (percentage >= 75) return 'from-lime-400 to-green-500';
    if (percentage >= 50) return 'from-amber-400 to-orange-500';
    if (percentage > 0) return 'from-rose-400 to-pink-500';
    return 'from-slate-200 to-slate-300';
  };

  return (
    <div className="glass rounded-2xl shadow-xl shadow-purple-900/10 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevYear}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-semibold text-slate-800 text-lg">{year}</div>
        <button
          onClick={nextYear}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Year Overview */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {yearData.map((monthData, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50 text-center"
          >
            <div className="text-xs font-semibold text-slate-500 mb-2">
              {MONTH_NAMES_SHORT[idx]}
            </div>
            <div className={`w-full h-2 rounded-full bg-gradient-to-r ${getColor(monthData.percentage)} mb-2`} />
            <div className="text-lg font-bold text-slate-700">{monthData.percentage}%</div>
            <div className="text-xs text-slate-400">
              {monthData.present}/{monthData.workingDays}
            </div>
          </div>
        ))}
      </div>

      {/* Year Stats */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-violet-700">{yearPercentage}%</div>
          <div className="text-sm text-violet-500 font-medium">Annual Attendance Rate</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600">{totalPresent}</div>
            <div className="text-xs text-slate-500">Days Present</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-slate-600">{totalWorkingDays}</div>
            <div className="text-xs text-slate-500">Working Days</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-2 rounded bg-gradient-to-r from-emerald-400 to-teal-500"></span>
          <span>90%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-2 rounded bg-gradient-to-r from-lime-400 to-green-500"></span>
          <span>75-89%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-2 rounded bg-gradient-to-r from-amber-400 to-orange-500"></span>
          <span>50-74%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-8 h-2 rounded bg-gradient-to-r from-rose-400 to-pink-500"></span>
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
