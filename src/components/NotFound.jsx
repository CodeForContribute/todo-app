/**
 * 404 Not Found component for unknown views/routes
 */
export function NotFound({ onNavigate }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] font-bold text-white/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-white/60 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 rounded-xl font-medium bg-white text-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-6 py-3 rounded-xl font-medium bg-white/20 text-white hover:bg-white/30 transition-all"
          >
            View Tasks
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm mb-4">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'attendance', label: 'Attendance' },
              { id: 'focus', label: 'Focus Timer' },
              { id: 'notes', label: 'Notes' },
              { id: 'expenses', label: 'Expenses' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
