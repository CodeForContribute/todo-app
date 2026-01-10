import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserData } from '../hooks/useFirestore';

const TIMER_MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: 'from-violet-500 to-purple-600' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'from-emerald-500 to-green-500' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'from-blue-500 to-cyan-500' },
};

export function PomodoroTimer() {
  const [stats, setStats, loading] = useUserData('pomodoroStats', {
    totalFocusTime: 0,
    sessionsCompleted: 0,
    todaySessions: 0,
    todayFocusTime: 0,
    lastSessionDate: null,
  });

  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsInCycle, setSessionsInCycle] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customDurations, setCustomDurations] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Check if it's a new day and reset daily stats
  useEffect(() => {
    if (stats && stats.lastSessionDate) {
      const lastDate = new Date(stats.lastSessionDate).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        setStats({
          ...stats,
          todaySessions: 0,
          todayFocusTime: 0,
        });
      }
    }
  }, [stats]);

  const playNotification = useCallback(() => {
    // Create audio context for notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification not supported');
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    playNotification();
    setIsRunning(false);

    if (mode === 'focus') {
      const newSessionsInCycle = sessionsInCycle + 1;
      setSessionsInCycle(newSessionsInCycle);

      // Update stats
      const focusDuration = customDurations.focus * 60;
      setStats({
        ...stats,
        totalFocusTime: (stats?.totalFocusTime || 0) + focusDuration,
        sessionsCompleted: (stats?.sessionsCompleted || 0) + 1,
        todaySessions: (stats?.todaySessions || 0) + 1,
        todayFocusTime: (stats?.todayFocusTime || 0) + focusDuration,
        lastSessionDate: new Date().toISOString(),
      });

      // After 4 focus sessions, suggest long break
      if (newSessionsInCycle >= 4) {
        setMode('longBreak');
        setTimeLeft(customDurations.longBreak * 60);
        setSessionsInCycle(0);
      } else {
        setMode('shortBreak');
        setTimeLeft(customDurations.shortBreak * 60);
      }
    } else {
      // Break finished, back to focus
      setMode('focus');
      setTimeLeft(customDurations.focus * 60);
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'focus' ? 'Focus session complete! Time for a break.' : 'Break is over! Ready to focus?',
        icon: '/favicon.ico',
      });
    }
  }, [mode, sessionsInCycle, stats, setStats, customDurations, playNotification]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  const toggleTimer = () => {
    if (!isRunning && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode] * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(customDurations[newMode] * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const progress = ((customDurations[mode] * 60 - timeLeft) / (customDurations[mode] * 60)) * 100;
  const currentModeConfig = TIMER_MODES[mode];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass rounded-xl p-3 shadow-lg shadow-purple-900/10 text-center">
          <div className="text-xl font-bold text-slate-800">{stats?.todaySessions || 0}</div>
          <div className="text-xs text-slate-400">Today's Sessions</div>
        </div>
        <div className="glass rounded-xl p-3 shadow-lg shadow-purple-900/10 text-center">
          <div className="text-xl font-bold text-slate-800">{formatDuration(stats?.todayFocusTime || 0)}</div>
          <div className="text-xs text-slate-400">Today's Focus</div>
        </div>
        <div className="glass rounded-xl p-3 shadow-lg shadow-purple-900/10 text-center">
          <div className="text-xl font-bold text-slate-800">{stats?.sessionsCompleted || 0}</div>
          <div className="text-xs text-slate-400">Total Sessions</div>
        </div>
        <div className="glass rounded-xl p-3 shadow-lg shadow-purple-900/10 text-center">
          <div className="text-xl font-bold text-slate-800">{formatDuration(stats?.totalFocusTime || 0)}</div>
          <div className="text-xs text-slate-400">Total Focus</div>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
        {/* Mode Selector */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-center gap-2">
            {Object.entries(TIMER_MODES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === key
                    ? `bg-gradient-to-r ${value.color} text-white shadow-lg`
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8 text-center">
          {/* Progress Ring */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-100"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#8b5cf6' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#a855f7' : mode === 'shortBreak' ? '#22c55e' : '#06b6d4'} />
                </linearGradient>
              </defs>
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-slate-800 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-sm font-medium mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${currentModeConfig.color} text-white`}>
                {currentModeConfig.label}
              </span>
            </div>
          </div>

          {/* Session Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all ${
                  num <= sessionsInCycle
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 scale-110'
                    : 'bg-slate-200'
                }`}
              />
            ))}
            <span className="text-xs text-slate-400 ml-2">
              {sessionsInCycle}/4 until long break
            </span>
          </div>

          {/* Current Task Input */}
          <div className="mb-6">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-4 py-3 text-center rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-slate-700"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={toggleTimer}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 ${
                isRunning
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : `bg-gradient-to-r ${currentModeConfig.color} hover:shadow-2xl`
              }`}
            >
              {isRunning ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">Pro tip:</strong>{' '}
                {mode === 'focus'
                  ? 'Stay focused! Avoid distractions and work on one task at a time.'
                  : mode === 'shortBreak'
                  ? 'Take a short walk, stretch, or grab some water.'
                  : 'Step away from your desk. A proper break helps you recharge!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Timer Settings</h3>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  value={customDurations.focus}
                  onChange={(e) => setCustomDurations({ ...customDurations, focus: parseInt(e.target.value) || 25 })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  value={customDurations.shortBreak}
                  onChange={(e) => setCustomDurations({ ...customDurations, shortBreak: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  value={customDurations.longBreak}
                  onChange={(e) => setCustomDurations({ ...customDurations, longBreak: parseInt(e.target.value) || 15 })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTimeLeft(customDurations[mode] * 60);
                  setShowSettings(false);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
