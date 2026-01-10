import { createContext, useContext, useCallback } from 'react';
import { useUserData } from '../hooks/useFirestore';

const GamificationContext = createContext(null);

// XP rewards for different actions
export const XP_REWARDS = {
  dailyCheckIn: 10,
  completeTask: 5,
  pomodoroSession: 15,
  streakBonus: 2, // per day
  achievementUnlock: 50,
};

// Level definitions
export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 100, title: 'Apprentice' },
  { level: 3, xpRequired: 300, title: 'Achiever' },
  { level: 4, xpRequired: 600, title: 'Productivity Pro' },
  { level: 5, xpRequired: 1000, title: 'Workspace Master' },
  { level: 6, xpRequired: 1500, title: 'Elite Performer' },
  { level: 7, xpRequired: 2200, title: 'Legendary' },
];

// Achievement definitions
export const ACHIEVEMENTS = {
  first_checkin: { title: 'First Steps', description: 'Complete your first check-in', icon: '🎯' },
  week_streak: { title: 'Week Warrior', description: '7-day attendance streak', icon: '🔥' },
  month_streak: { title: 'Monthly Master', description: '30-day attendance streak', icon: '🏆' },
  task_master: { title: 'Task Master', description: 'Complete 100 tasks', icon: '✅' },
  zero_inbox: { title: 'Zero Inbox', description: 'Complete all tasks in a day', icon: '📭' },
  focus_champion: { title: 'Focus Champion', description: 'Complete 50 Pomodoro sessions', icon: '🎯' },
  deep_work: { title: 'Deep Work', description: '4+ hours focus in a day', icon: '🧠' },
};

const defaultGamificationData = {
  xp: 0,
  level: 1,
  streaks: {
    attendance: { current: 0, longest: 0, lastDate: null },
    tasks: { current: 0, longest: 0, lastDate: null },
    focus: { current: 0, longest: 0, lastDate: null },
  },
  achievements: {
    earned: [],
    earnedDates: {},
  },
  stats: {
    totalCheckIns: 0,
    totalTasksCompleted: 0,
    totalPomodoroSessions: 0,
  },
};

export function GamificationProvider({ children }) {
  const [data, setData, loading] = useUserData('gamification', defaultGamificationData);

  const getCurrentLevel = useCallback(() => {
    const xp = data?.xp || 0;
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
      if (xp >= level.xpRequired) {
        currentLevel = level;
      } else {
        break;
      }
    }
    return currentLevel;
  }, [data?.xp]);

  const getNextLevel = useCallback(() => {
    const currentLevel = getCurrentLevel();
    const nextIndex = LEVELS.findIndex((l) => l.level === currentLevel.level) + 1;
    return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
  }, [getCurrentLevel]);

  const getProgressToNextLevel = useCallback(() => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;

    const xp = data?.xp || 0;
    const currentLevelXP = currentLevel.xpRequired;
    const nextLevelXP = nextLevel.xpRequired;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [data?.xp, getCurrentLevel, getNextLevel]);

  const addXP = useCallback((amount, reason) => {
    setData((prev) => ({
      ...prev,
      xp: (prev?.xp || 0) + amount,
    }));
  }, [setData]);

  const updateStreak = useCallback((type) => {
    const today = new Date().toDateString();
    const streaks = data?.streaks || defaultGamificationData.streaks;
    const currentStreak = streaks[type] || { current: 0, longest: 0, lastDate: null };

    // Check if already updated today
    if (currentStreak.lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday = currentStreak.lastDate === yesterday.toDateString();

    const newCurrent = wasYesterday ? currentStreak.current + 1 : 1;
    const newLongest = Math.max(currentStreak.longest, newCurrent);

    setData((prev) => ({
      ...prev,
      streaks: {
        ...prev?.streaks,
        [type]: {
          current: newCurrent,
          longest: newLongest,
          lastDate: today,
        },
      },
    }));

    // Add streak bonus XP
    if (newCurrent > 1) {
      addXP(XP_REWARDS.streakBonus * newCurrent, `${type} streak bonus`);
    }
  }, [data?.streaks, setData, addXP]);

  const unlockAchievement = useCallback((achievementId) => {
    const earned = data?.achievements?.earned || [];
    if (earned.includes(achievementId)) return;

    setData((prev) => ({
      ...prev,
      achievements: {
        earned: [...(prev?.achievements?.earned || []), achievementId],
        earnedDates: {
          ...prev?.achievements?.earnedDates,
          [achievementId]: new Date().toISOString(),
        },
      },
    }));

    addXP(XP_REWARDS.achievementUnlock, `Achievement: ${ACHIEVEMENTS[achievementId]?.title}`);
  }, [data?.achievements?.earned, setData, addXP]);

  const recordAction = useCallback((action) => {
    const stats = data?.stats || defaultGamificationData.stats;

    switch (action) {
      case 'checkIn':
        setData((prev) => ({
          ...prev,
          stats: { ...prev?.stats, totalCheckIns: (prev?.stats?.totalCheckIns || 0) + 1 },
        }));
        addXP(XP_REWARDS.dailyCheckIn, 'Daily check-in');
        updateStreak('attendance');

        // Check achievements
        if ((stats.totalCheckIns || 0) === 0) {
          unlockAchievement('first_checkin');
        }
        break;

      case 'completeTask':
        setData((prev) => ({
          ...prev,
          stats: { ...prev?.stats, totalTasksCompleted: (prev?.stats?.totalTasksCompleted || 0) + 1 },
        }));
        addXP(XP_REWARDS.completeTask, 'Task completed');
        updateStreak('tasks');

        // Check task master achievement
        if ((stats.totalTasksCompleted || 0) + 1 >= 100) {
          unlockAchievement('task_master');
        }
        break;

      case 'pomodoroComplete':
        setData((prev) => ({
          ...prev,
          stats: { ...prev?.stats, totalPomodoroSessions: (prev?.stats?.totalPomodoroSessions || 0) + 1 },
        }));
        addXP(XP_REWARDS.pomodoroSession, 'Pomodoro session');
        updateStreak('focus');

        // Check focus champion achievement
        if ((stats.totalPomodoroSessions || 0) + 1 >= 50) {
          unlockAchievement('focus_champion');
        }
        break;
    }
  }, [data?.stats, setData, addXP, updateStreak, unlockAchievement]);

  const value = {
    data,
    loading,
    xp: data?.xp || 0,
    streaks: data?.streaks || defaultGamificationData.streaks,
    achievements: data?.achievements || defaultGamificationData.achievements,
    stats: data?.stats || defaultGamificationData.stats,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    addXP,
    updateStreak,
    unlockAchievement,
    recordAction,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
