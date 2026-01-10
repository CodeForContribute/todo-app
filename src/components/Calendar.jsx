import { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, formatDateKey, MONTH_NAMES } from '../utils/dateUtils';

export function Calendar({ selectedDate, onDateSelect, todosData }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const today = new Date();
  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleYearChange = (e) => {
    setViewDate(new Date(parseInt(e.target.value), month, 1));
  };

  const handleMonthChange = (e) => {
    setViewDate(new Date(year, parseInt(e.target.value), 1));
  };

  const handleDateClick = (day) => {
    onDateSelect(new Date(year, month, day));
  };

  const getTodoCount = (day) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return todosData[dateKey]?.length || 0;
  };

  const getCompletedCount = (day) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return todosData[dateKey]?.filter(t => t.completed).length || 0;
  };

  const days = [];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(new Date(year, month, day));
    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedKey;
    const todoCount = getTodoCount(day);
    const completedCount = getCompletedCount(day);
    const hasAllCompleted = todoCount > 0 && completedCount === todoCount;

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          h-10 w-10 rounded-xl flex flex-col items-center justify-center text-sm font-medium
          transition-all duration-200 relative group
          ${isSelected
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
            : isToday
              ? 'bg-violet-100 text-violet-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }
        `}
      >
        <span className={isSelected ? 'font-semibold' : ''}>{day}</span>
        {todoCount > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            <span
              className={`
                w-1 h-1 rounded-full transition-colors
                ${isSelected
                  ? 'bg-white/80'
                  : hasAllCompleted
                    ? 'bg-emerald-400'
                    : 'bg-violet-400'
                }
              `}
            />
            {todoCount > 1 && (
              <span
                className={`
                  w-1 h-1 rounded-full transition-colors
                  ${isSelected
                    ? 'bg-white/60'
                    : hasAllCompleted
                      ? 'bg-emerald-300'
                      : 'bg-violet-300'
                  }
                `}
              />
            )}
            {todoCount > 2 && (
              <span
                className={`
                  w-1 h-1 rounded-full transition-colors
                  ${isSelected
                    ? 'bg-white/40'
                    : hasAllCompleted
                      ? 'bg-emerald-200'
                      : 'bg-violet-200'
                  }
                `}
              />
            )}
          </div>
        )}
      </button>
    );
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-xl shadow-purple-900/10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          <select
            value={month}
            onChange={handleMonthChange}
            className="appearance-none bg-transparent text-slate-800 font-semibold text-lg cursor-pointer hover:text-violet-600 transition-colors focus:outline-none"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={handleYearChange}
            className="appearance-none bg-transparent text-slate-400 font-medium cursor-pointer hover:text-violet-600 transition-colors focus:outline-none"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, idx) => (
          <div
            key={idx}
            className="h-8 w-10 flex items-center justify-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span>Has tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>All done</span>
        </div>
      </div>
    </div>
  );
}
