import { formatDateKey } from './dateUtils';

// Leave type labels
const LEAVE_LABELS = {
  casual: 'Casual Leave (CL)',
  sick: 'Sick Leave (SL)',
  earned: 'Earned Leave (EL)',
  wfh: 'Work From Home',
  compOff: 'Comp Off',
  lop: 'Loss of Pay',
};

// Level definitions
const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 100, title: 'Apprentice' },
  { level: 3, xpRequired: 300, title: 'Achiever' },
  { level: 4, xpRequired: 600, title: 'Productivity Pro' },
  { level: 5, xpRequired: 1000, title: 'Workspace Master' },
  { level: 6, xpRequired: 1500, title: 'Elite Performer' },
  { level: 7, xpRequired: 2200, title: 'Legendary' },
];

// Calculate used leaves for a type
function calculateUsedLeaves(leaves, type) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  return (leaves || [])
    .filter((leave) => {
      if (leave.type !== type || leave.status === 'cancelled') return false;
      const leaveStart = new Date(leave.startDate);
      return leaveStart >= yearStart && leaveStart <= now;
    })
    .reduce((total, leave) => {
      const days = leave.isHalfDay
        ? 0.5
        : Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
}

// Handle leave queries
function handleLeaveQuery(query, data) {
  const { leaveData } = data;
  if (!leaveData) {
    return "I couldn't find your leave data. Please make sure you're logged in.";
  }

  const quotas = leaveData.quotas || {};
  const leaves = leaveData.leaves || [];

  // Check for specific leave type
  const clMatch = query.match(/\bcl\b|casual/i);
  const slMatch = query.match(/\bsl\b|sick/i);
  const elMatch = query.match(/\bel\b|earned/i);
  const wfhMatch = query.match(/wfh|work\s*from\s*home/i);

  if (clMatch) {
    const used = calculateUsedLeaves(leaves, 'casual');
    const remaining = Math.max(0, (quotas.casual || 12) - used);
    return `You have **${remaining} Casual Leaves** remaining out of ${quotas.casual || 12}. Used: ${used} days.`;
  }

  if (slMatch) {
    const used = calculateUsedLeaves(leaves, 'sick');
    const remaining = Math.max(0, (quotas.sick || 6) - used);
    return `You have **${remaining} Sick Leaves** remaining out of ${quotas.sick || 6}. Used: ${used} days.`;
  }

  if (elMatch) {
    const used = calculateUsedLeaves(leaves, 'earned');
    const remaining = Math.max(0, (quotas.earned || 15) - used);
    return `You have **${remaining} Earned Leaves** remaining out of ${quotas.earned || 15}. Used: ${used} days.`;
  }

  if (wfhMatch) {
    const used = calculateUsedLeaves(leaves, 'wfh');
    const remaining = Math.max(0, (quotas.wfh || 24) - used);
    return `You have **${remaining} WFH days** remaining out of ${quotas.wfh || 24}. Used: ${used} days.`;
  }

  // General leave balance
  const balances = [];
  const defaultQuotas = { casual: 12, sick: 6, earned: 15, wfh: 24 };
  const types = ['casual', 'sick', 'earned', 'wfh'];

  types.forEach((type) => {
    const quota = quotas[type] !== undefined ? quotas[type] : defaultQuotas[type];
    const used = calculateUsedLeaves(leaves, type);
    const remaining = Math.max(0, quota - used);
    balances.push(`• ${LEAVE_LABELS[type]}: **${remaining}** / ${quota}`);
  });

  if (balances.length === 0) {
    return "No leave quotas are configured yet. Please set up your leave quotas in the Leave Tracker.";
  }

  return `Here's your leave balance:\n\n${balances.join('\n')}`;
}

// Handle attendance queries
function handleAttendanceQuery(query, data) {
  const { attendance } = data;
  const today = formatDateKey(new Date());
  const todayAttendance = attendance?.[today];

  // Calculate streak
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const key = formatDateKey(checkDate);
    if (attendance?.[key]?.checkIn) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (key !== today) {
      break;
    } else {
      break;
    }
    if (streak > 365) break;
  }

  if (query.match(/streak/i)) {
    if (streak === 0) {
      return "You don't have an active attendance streak. Check in to start one!";
    }
    return `Your current attendance streak is **${streak} day${streak > 1 ? 's' : ''}**! Keep it going!`;
  }

  if (query.match(/check.?in|checked|status/i)) {
    if (!todayAttendance?.checkIn) {
      return "You haven't checked in today yet. Would you like to check in?";
    }
    if (todayAttendance.checkOut) {
      return `You checked in at **${formatTime(todayAttendance.checkIn)}** and checked out at **${formatTime(todayAttendance.checkOut)}**.`;
    }
    return `You're currently checked in since **${formatTime(todayAttendance.checkIn)}**. You've been working for ${calculateWorkingHours(todayAttendance)} hours.`;
  }

  if (query.match(/hour|time|duration/i)) {
    if (!todayAttendance?.checkIn) {
      return "You haven't checked in today, so no working hours recorded yet.";
    }
    return `Today's working hours: **${calculateWorkingHours(todayAttendance)} hours**`;
  }

  // Calculate this week's attendance
  if (query.match(/week|weekly/i)) {
    const weekDays = getWeekDays();
    const presentDays = weekDays.filter((d) => attendance?.[d]?.checkIn).length;
    return `This week's attendance: **${presentDays}/${weekDays.length} days**${streak > 0 ? `\nCurrent streak: ${streak} days` : ''}`;
  }

  // Default attendance response
  if (todayAttendance?.checkIn) {
    const status = todayAttendance.checkOut ? 'checked out' : 'currently working';
    return `Today's attendance: ${status}\n• Check-in: ${formatTime(todayAttendance.checkIn)}${todayAttendance.checkOut ? `\n• Check-out: ${formatTime(todayAttendance.checkOut)}` : ''}\n• Hours: ${calculateWorkingHours(todayAttendance)}${streak > 0 ? `\n• Streak: ${streak} days` : ''}`;
  }
  return "You haven't checked in today.";
}

// Handle task queries
function handleTaskQuery(query, data) {
  const { todos } = data;
  const today = formatDateKey(new Date());
  const todayTodos = todos?.[today] || [];
  const allTodos = Object.values(todos || {}).flat();

  if (query.match(/today/i)) {
    const pending = todayTodos.filter((t) => !t.completed).length;
    const completed = todayTodos.filter((t) => t.completed).length;
    if (todayTodos.length === 0) {
      return "You don't have any tasks scheduled for today.";
    }
    return `Today's tasks:\n• Pending: **${pending}**\n• Completed: **${completed}**\n• Total: ${todayTodos.length}`;
  }

  if (query.match(/pending|remaining|left/i)) {
    const pending = todayTodos.filter((t) => !t.completed);
    if (pending.length === 0) {
      return "You have no pending tasks for today. Great job!";
    }
    const taskList = pending.slice(0, 5).map((t) => `• ${t.text}`).join('\n');
    return `You have **${pending.length} pending task${pending.length > 1 ? 's' : ''}** today:\n\n${taskList}${pending.length > 5 ? `\n... and ${pending.length - 5} more` : ''}`;
  }

  if (query.match(/completed|done|finished/i)) {
    const completed = todayTodos.filter((t) => t.completed);
    return `You've completed **${completed.length} task${completed.length !== 1 ? 's' : ''}** today.`;
  }

  if (query.match(/total|all|overall/i)) {
    const totalPending = allTodos.filter((t) => !t.completed).length;
    const totalCompleted = allTodos.filter((t) => t.completed).length;
    return `Overall task stats:\n• Total pending: **${totalPending}**\n• Total completed: **${totalCompleted}**`;
  }

  // Default
  const pending = todayTodos.filter((t) => !t.completed).length;
  return `You have **${pending} pending task${pending !== 1 ? 's' : ''}** for today.`;
}

// Handle focus/pomodoro queries
function handleFocusQuery(query, data) {
  const { pomodoroStats } = data;
  const today = new Date().toDateString();
  const isToday = pomodoroStats?.lastSessionDate && new Date(pomodoroStats.lastSessionDate).toDateString() === today;

  const todaySessions = isToday ? pomodoroStats?.todaySessions || 0 : 0;
  const todayMinutes = isToday ? Math.round((pomodoroStats?.todayFocusTime || 0) / 60) : 0;
  const totalHours = Math.round((pomodoroStats?.totalFocusTime || 0) / 3600);

  if (query.match(/today/i)) {
    if (todaySessions === 0) {
      return "You haven't completed any focus sessions today. Ready to start one?";
    }
    return `Today's focus:\n• Sessions: **${todaySessions}**\n• Focus time: **${todayMinutes} minutes**`;
  }

  if (query.match(/total|all|overall/i)) {
    return `Total focus stats:\n• All-time sessions: **${pomodoroStats?.totalSessions || 0}**\n• Total focus time: **${totalHours} hours**`;
  }

  // Default
  return `Focus summary:\n• Today: **${todaySessions} sessions** (${todayMinutes} min)\n• All-time: **${pomodoroStats?.totalSessions || 0} sessions** (${totalHours}h)`;
}

// Handle expense queries
function handleExpenseQuery(query, data) {
  const { expenseData } = data;
  const expenses = expenseData?.expenses || [];

  if (expenses.length === 0) {
    return "You haven't recorded any expenses yet. Start tracking in the Expenses section!";
  }

  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const expDate = new Date(e.date);
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });

  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + (e.amount || 0), 0);
  const allTimeTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Group by category for this month
  const categoryTotals = {};
  thisMonth.forEach((e) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
  });

  if (query.match(/category|breakdown/i)) {
    if (Object.keys(categoryTotals).length === 0) {
      return "No expenses recorded this month.";
    }
    const breakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `• ${cat}: **₹${amt.toLocaleString()}**`)
      .join('\n');
    return `This month's expenses by category:\n\n${breakdown}`;
  }

  if (query.match(/month|this month/i)) {
    return `This month's expenses: **₹${thisMonthTotal.toLocaleString()}** (${thisMonth.length} transactions)`;
  }

  if (query.match(/total|all/i)) {
    return `Total expenses: **₹${allTimeTotal.toLocaleString()}** (${expenses.length} transactions)`;
  }

  // Default
  return `Expense summary:\n• This month: **₹${thisMonthTotal.toLocaleString()}**\n• All-time: **₹${allTimeTotal.toLocaleString()}**`;
}

// Handle trip queries
function handleTripQuery(query, data) {
  const { tripData } = data;
  const trips = tripData?.items || [];

  if (trips.length === 0) {
    return "You don't have any trips planned. Plan one in the Trips section!";
  }

  const now = new Date();
  const upcoming = trips.filter((t) => {
    const startDate = new Date(t.startDate);
    return startDate >= now && t.status !== 'cancelled';
  });

  const ongoing = trips.filter((t) => t.status === 'ongoing');
  const completed = trips.filter((t) => t.status === 'completed');

  if (query.match(/upcoming|planned|future|next/i)) {
    if (upcoming.length === 0) {
      return "You don't have any upcoming trips.";
    }
    const tripList = upcoming.slice(0, 3).map((t) =>
      `• **${t.destination}** (${new Date(t.startDate).toLocaleDateString()})`
    ).join('\n');
    return `Upcoming trips:\n${tripList}${upcoming.length > 3 ? `\n... and ${upcoming.length - 3} more` : ''}`;
  }

  if (query.match(/ongoing|current/i)) {
    if (ongoing.length === 0) {
      return "You're not on any trip currently.";
    }
    return `Currently on trip to: **${ongoing[0].destination}**`;
  }

  // Default
  return `Trip summary:\n• Upcoming: **${upcoming.length}**\n• Ongoing: **${ongoing.length}**\n• Completed: **${completed.length}**\n• Total: **${trips.length}**`;
}

// Handle salary queries
function handleSalaryQuery(query, data) {
  const { salaryData } = data;

  if (!salaryData) {
    return "You haven't set up your salary details yet. Configure them in the Salary Calculator section!";
  }

  const { basic, hra, da, specialAllowance, lta, medicalAllowance, pf, professionalTax, incomeTax, otherDeductions } = salaryData;

  const grossSalary = (basic || 0) + (hra || 0) + (da || 0) + (specialAllowance || 0) + (lta || 0) + (medicalAllowance || 0);
  const totalDeductions = (pf || 0) + (professionalTax || 0) + (incomeTax || 0) + (otherDeductions || 0);
  const netSalary = grossSalary - totalDeductions;

  if (query.match(/take.?home|net|in.?hand/i)) {
    return `Your take-home salary is **₹${netSalary.toLocaleString()}** per month.`;
  }

  if (query.match(/gross|ctc|total/i)) {
    return `Your gross salary is **₹${grossSalary.toLocaleString()}** per month.`;
  }

  if (query.match(/deduction/i)) {
    return `Monthly deductions:\n• PF: ₹${(pf || 0).toLocaleString()}\n• Professional Tax: ₹${(professionalTax || 0).toLocaleString()}\n• Income Tax: ₹${(incomeTax || 0).toLocaleString()}\n• **Total: ₹${totalDeductions.toLocaleString()}**`;
  }

  if (query.match(/breakdown|detail/i)) {
    return `Salary breakdown:\n\n**Earnings:**\n• Basic: ₹${(basic || 0).toLocaleString()}\n• HRA: ₹${(hra || 0).toLocaleString()}\n• Special Allowance: ₹${(specialAllowance || 0).toLocaleString()}\n\n**Deductions:**\n• PF: ₹${(pf || 0).toLocaleString()}\n• Tax: ₹${(incomeTax || 0).toLocaleString()}\n\n**Net: ₹${netSalary.toLocaleString()}**`;
  }

  // Default
  return `Salary summary:\n• Gross: **₹${grossSalary.toLocaleString()}**\n• Deductions: ₹${totalDeductions.toLocaleString()}\n• Take-home: **₹${netSalary.toLocaleString()}**`;
}

// Handle tax queries
function handleTaxQuery(query, data) {
  const { salaryData } = data;

  if (!salaryData) {
    return "Set up your salary in the Salary Calculator to see tax estimates, or use the Tax Calculator for detailed calculations.";
  }

  const annualIncome = ((salaryData.basic || 0) + (salaryData.hra || 0) + (salaryData.specialAllowance || 0)) * 12;
  const monthlyTax = salaryData.incomeTax || 0;
  const annualTax = monthlyTax * 12;

  if (query.match(/monthly/i)) {
    return `Your monthly income tax is approximately **₹${monthlyTax.toLocaleString()}**.`;
  }

  if (query.match(/annual|yearly/i)) {
    return `Your estimated annual tax is **₹${annualTax.toLocaleString()}** on income of ₹${annualIncome.toLocaleString()}.`;
  }

  if (query.match(/slab|regime|calculate/i)) {
    return "For detailed tax calculations with slabs and deductions, please use the **Tax Calculator** section. I can show you basic estimates here.";
  }

  // Default
  return `Tax summary:\n• Monthly TDS: **₹${monthlyTax.toLocaleString()}**\n• Annual Tax (est.): **₹${annualTax.toLocaleString()}**\n\nFor detailed calculations, use the Tax Calculator.`;
}

// Handle gamification/XP/level queries
function handleGamificationQuery(query, data) {
  const { gamificationData } = data;
  const xp = gamificationData?.xp || 0;
  const streaks = gamificationData?.streaks || {};
  const achievements = gamificationData?.achievements?.earned || [];

  // Calculate level
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }

  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const xpToNext = nextLevel ? nextLevel.xpRequired - xp : 0;

  if (query.match(/level/i)) {
    return `You're at **Level ${currentLevel.level}: ${currentLevel.title}** with **${xp} XP**${nextLevel ? `\n${xpToNext} XP needed for Level ${nextLevel.level}` : ' (Max level!)'}`;
  }

  if (query.match(/xp|point|experience/i)) {
    return `You have **${xp} XP**\n• Level: ${currentLevel.level} (${currentLevel.title})${nextLevel ? `\n• Next level: ${xpToNext} XP away` : ''}`;
  }

  if (query.match(/streak/i)) {
    const attStreak = streaks.attendance?.current || 0;
    const taskStreak = streaks.tasks?.current || 0;
    const focusStreak = streaks.focus?.current || 0;
    return `Your streaks:\n• Attendance: **${attStreak} days**\n• Tasks: **${taskStreak} days**\n• Focus: **${focusStreak} days**`;
  }

  if (query.match(/achievement|badge/i)) {
    if (achievements.length === 0) {
      return "You haven't unlocked any achievements yet. Keep using the app to earn badges!";
    }
    return `You've earned **${achievements.length} achievement${achievements.length > 1 ? 's' : ''}**! Check the dashboard to see your badges.`;
  }

  // Default
  return `Your progress:\n• Level: **${currentLevel.level}** (${currentLevel.title})\n• XP: **${xp}**\n• Achievements: **${achievements.length}** unlocked`;
}

// Handle notes queries
function handleNotesQuery(query, data) {
  const { notesData } = data;
  const notes = notesData?.items || [];

  if (notes.length === 0) {
    return "You haven't created any notes yet. Start capturing ideas in the Notes section!";
  }

  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 3);

  if (query.match(/recent|latest/i)) {
    const noteList = recentNotes.map((n) => `• ${n.title || 'Untitled'}`).join('\n');
    return `Recent notes:\n${noteList}`;
  }

  if (query.match(/count|how many|total/i)) {
    return `You have **${notes.length} note${notes.length !== 1 ? 's' : ''}** saved.`;
  }

  // Default
  return `Notes: **${notes.length}** total\n\nRecent:\n${recentNotes.map((n) => `• ${n.title || 'Untitled'}`).join('\n')}`;
}

// Handle links queries
function handleLinksQuery(query, data) {
  const { linksData } = data;
  const links = linksData?.items || [];

  if (links.length === 0) {
    return "You haven't saved any quick links yet. Add frequently used URLs in the Quick Links section!";
  }

  if (query.match(/count|how many|total/i)) {
    return `You have **${links.length} quick link${links.length !== 1 ? 's' : ''}** saved.`;
  }

  // Default - show links
  const linkList = links.slice(0, 5).map((l) => `• ${l.title || l.url}`).join('\n');
  return `Your quick links (${links.length} total):\n${linkList}${links.length > 5 ? '\n... and more' : ''}`;
}

// Handle summary/overview queries
function handleSummaryQuery(query, data) {
  const { todos, attendance, leaveData, pomodoroStats } = data;
  const today = formatDateKey(new Date());

  // Today's tasks
  const todayTodos = todos?.[today] || [];
  const pendingTasks = todayTodos.filter((t) => !t.completed).length;

  // Attendance
  const todayAttendance = attendance?.[today];
  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;

  // Focus
  const todayDate = new Date().toDateString();
  const isToday = pomodoroStats?.lastSessionDate && new Date(pomodoroStats.lastSessionDate).toDateString() === todayDate;
  const todaySessions = isToday ? pomodoroStats?.todaySessions || 0 : 0;

  // Leave balance
  const defaultQuotas = { casual: 12, sick: 6, earned: 15 };
  const quotas = leaveData?.quotas || {};
  const leaves = leaveData?.leaves || [];
  const totalLeaveBalance = ['casual', 'sick', 'earned'].reduce((sum, type) => {
    const quota = quotas[type] !== undefined ? quotas[type] : defaultQuotas[type];
    const used = calculateUsedLeaves(leaves, type);
    return sum + Math.max(0, quota - used);
  }, 0);

  return `**Today's Summary**\n\n• Attendance: ${isCheckedIn ? 'Checked in' : todayAttendance?.checkOut ? 'Checked out' : 'Not checked in'}\n• Tasks: ${pendingTasks} pending\n• Focus: ${todaySessions} sessions\n• Leave balance: ${totalLeaveBalance} days`;
}

// Handle help queries
function handleHelpQuery() {
  return `I can help you with:\n
**Work**
• "am I checked in", "attendance streak"
• "pending tasks", "tasks for today"
• "focus time", "pomodoro sessions"

**Leaves & Time Off**
• "leave balance", "how many CL left"
• "upcoming trips"

**Finance**
• "salary", "take-home pay", "deductions"
• "expenses this month", "expense breakdown"
• "tax estimate"

**Progress**
• "my level", "XP points", "achievements"
• "my streaks"

**Other**
• "my notes", "quick links"
• "summary" - overall status

Just ask naturally!`;
}

// Handle greeting
function handleGreeting(query, data) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = data.userName?.split(' ')[0] || 'there';
  return `${greeting}, ${name}! How can I help you today?\n\nTry asking about your leaves, tasks, salary, or type "help" for more options.`;
}

// Handle thank you
function handleThankYou() {
  const responses = [
    "You're welcome! Let me know if you need anything else.",
    "Happy to help! Anything else you'd like to know?",
    "Anytime! Feel free to ask more questions.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Utility functions
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateWorkingHours(attendance) {
  if (!attendance?.checkIn) return '0';
  const checkIn = new Date(attendance.checkIn);
  const checkOut = attendance.checkOut ? new Date(attendance.checkOut) : new Date();
  const hours = (checkOut - checkIn) / (1000 * 60 * 60);
  return hours.toFixed(1);
}

function getWeekDays() {
  const days = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 5; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    if (day <= now) {
      days.push(formatDateKey(day));
    }
  }
  return days;
}

// Main query processor
export function processQuery(query, data) {
  const trimmedQuery = query.trim().toLowerCase();

  // Pattern matching - order matters (more specific first)
  const patterns = [
    { regex: /^(hi|hello|hey|good\s*(morning|afternoon|evening))/i, handler: handleGreeting },
    { regex: /^(thanks|thank you|thx)/i, handler: handleThankYou },
    { regex: /help|what can you|how to use|commands/i, handler: handleHelpQuery },
    { regex: /summary|overview|status|today.?s\s*summary/i, handler: handleSummaryQuery },
    { regex: /salary|take.?home|net\s*pay|gross|ctc|pay.?slip|in.?hand/i, handler: handleSalaryQuery },
    { regex: /\btax\b|tds|income\s*tax|slab/i, handler: handleTaxQuery },
    { regex: /level|xp\b|experience|achievement|badge|progress|streak/i, handler: handleGamificationQuery },
    { regex: /note|notes/i, handler: handleNotesQuery },
    { regex: /link|links|bookmark|url/i, handler: handleLinksQuery },
    { regex: /leave|cl\b|sl\b|el\b|wfh|balance|quota/i, handler: handleLeaveQuery },
    { regex: /attendance|check.?in|checked|work.?hour|office/i, handler: handleAttendanceQuery },
    { regex: /task|todo|pending|completed|done/i, handler: handleTaskQuery },
    { regex: /focus|pomodoro|session|concentrate/i, handler: handleFocusQuery },
    { regex: /expense|spent|spending|money/i, handler: handleExpenseQuery },
    { regex: /trip|travel|journey/i, handler: handleTripQuery },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(trimmedQuery)) {
      return pattern.handler(trimmedQuery, data);
    }
  }

  // Default response
  return "I'm not sure I understand. Try asking about:\n• Leaves, attendance, tasks\n• Salary, expenses, tax\n• Level, XP, achievements\n• Notes, links, trips\n\nOr type \"help\" for examples.";
}
