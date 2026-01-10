import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full ring-2 ring-white/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-medium text-sm ring-2 ring-white/50">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
          </div>
        )}
        <span className="text-sm font-medium text-white hidden sm:block">
          {user.displayName?.split(' ')[0] || 'User'}
        </span>
        <svg
          className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-purple-900/20 overflow-hidden animate-scale-in z-50">
          {/* User Info */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-xl"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">
                  {user.displayName || 'User'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
            >
              <svg
                className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
