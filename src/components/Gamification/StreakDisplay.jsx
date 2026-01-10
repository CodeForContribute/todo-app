import { useGamification } from '../../contexts/GamificationContext';

export function StreakDisplay() {
  const { streaks, getCurrentLevel, getProgressToNextLevel, xp } = useGamification();

  const attendanceStreak = streaks?.attendance?.current || 0;
  const level = getCurrentLevel();
  const progress = getProgressToNextLevel();

  return (
    <div className="flex items-center gap-4">
      {/* Streak Badge */}
      {attendanceStreak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-white font-bold text-lg leading-none">{attendanceStreak}</p>
            <p className="text-white/60 text-xs">day streak</p>
          </div>
        </div>
      )}

      {/* Level Badge */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-2xl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold">
            {level.level}
          </div>
          {/* Progress ring */}
          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 113} 113`}
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-none">{level.title}</p>
          <p className="text-white/60 text-xs">{xp} XP</p>
        </div>
      </div>
    </div>
  );
}
