import { useGamification, LEVELS } from '../../contexts/GamificationContext';

export function LevelProgress({ compact = false }) {
  const { xp, getCurrentLevel, getNextLevel, getProgressToNextLevel } = useGamification();

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getProgressToNextLevel();

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {currentLevel.level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm font-medium truncate">{currentLevel.title}</span>
            <span className="text-white/60 text-xs">{xp} XP</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-xl shadow-purple-900/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Your Level</h3>
        <span className="text-sm text-slate-500">{xp} XP total</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/30">
          {currentLevel.level}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800">{currentLevel.title}</p>
          {nextLevel && (
            <p className="text-sm text-slate-500">
              {nextLevel.xpRequired - xp} XP to {nextLevel.title}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-500">Progress</span>
          <span className="font-medium text-slate-700">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Level milestones */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 mb-3">Milestones</p>
        <div className="flex items-center justify-between">
          {LEVELS.slice(0, 5).map((level) => (
            <div
              key={level.level}
              className={`flex flex-col items-center ${
                xp >= level.xpRequired ? 'text-violet-600' : 'text-slate-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  xp >= level.xpRequired
                    ? 'bg-violet-100'
                    : 'bg-slate-100'
                }`}
              >
                {level.level}
              </div>
              <span className="text-xs mt-1">{level.xpRequired}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
