import { formatDateKey } from './dateUtils';

export function getWeekDates(date) {
  const current = new Date(date);
  const week = [];

  // Get Monday of the current week
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }

  return week;
}

export function getMonthDates(year, month) {
  const dates = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

export function getYearData(year, attendanceData) {
  const months = [];

  for (let month = 0; month < 12; month++) {
    const monthDates = getMonthDates(year, month);
    let present = 0;
    let workingDays = 0;

    monthDates.forEach(date => {
      const day = date.getDay();
      if (day !== 0 && day !== 6) { // Not weekend
        workingDays++;
        const key = formatDateKey(date);
        if (attendanceData[key]?.status === 'present') {
          present++;
        }
      }
    });

    months.push({
      month,
      present,
      workingDays,
      percentage: workingDays > 0 ? Math.round((present / workingDays) * 100) : 0
    });
  }

  return months;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isToday(date) {
  const today = new Date();
  return formatDateKey(date) === formatDateKey(today);
}

export function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}

export function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function calculateWorkingHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;

  const diff = new Date(checkOut) - new Date(checkIn);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export function getAttendanceStats(attendanceData, startDate, endDate) {
  let present = 0;
  let absent = 0;
  let workingDays = 0;
  let totalHours = 0;
  let totalMinutes = 0;

  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (!isWeekend(current) && !isFutureDate(current)) {
      workingDays++;
      const key = formatDateKey(current);
      const record = attendanceData[key];

      if (record?.status === 'present') {
        present++;
        if (record.checkIn && record.checkOut) {
          const hours = calculateWorkingHours(record.checkIn, record.checkOut);
          if (hours) {
            totalHours += hours.hours;
            totalMinutes += hours.minutes;
          }
        }
      } else {
        absent++;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  // Convert excess minutes to hours
  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;

  return {
    present,
    absent,
    workingDays,
    percentage: workingDays > 0 ? Math.round((present / workingDays) * 100) : 0,
    avgHours: present > 0 ? (totalHours / present).toFixed(1) : 0
  };
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
