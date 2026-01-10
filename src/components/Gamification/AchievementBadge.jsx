import { ACHIEVEMENTS } from '../../contexts/GamificationContext';

export function AchievementBadge({ achievementId, earned = false, earnedDate }) {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return null;

  return (
    <div
      className={`
        relative p-4 rounded-2xl transition-all duration-300
        ${earned
          ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200'
          : 'bg-slate-50 border-2 border-slate-100 opacity-50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            text-3xl p-2 rounded-xl
            ${earned ? 'bg-white shadow-md' : 'bg-slate-100 grayscale'}
          `}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${earned ? 'text-slate-800' : 'text-slate-400'}`}>
            {achievement.title}
          </p>
          <p className={`text-sm ${earned ? 'text-slate-600' : 'text-slate-300'}`}>
            {achievement.description}
          </p>
          {earned && earnedDate && (
            <p className="text-xs text-amber-600 mt-1">
              Earned {new Date(earnedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {earned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function AchievementsList() {
  const { useGamification } = require('../../contexts/GamificationContext');
  const { achievements } = useGamification();

  const earnedIds = achievements?.earned || [];
  const earnedDates = achievements?.earnedDates || {};

  return (
    <div className="glass rounded-2xl p-6 shadow-xl shadow-purple-900/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Achievements</h3>
        <span className="text-sm text-slate-500">
          {earnedIds.length}/{Object.keys(ACHIEVEMENTS).length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(ACHIEVEMENTS).map((id) => (
          <AchievementBadge
            key={id}
            achievementId={id}
            earned={earnedIds.includes(id)}
            earnedDate={earnedDates[id]}
          />
        ))}
      </div>
    </div>
  );
}
