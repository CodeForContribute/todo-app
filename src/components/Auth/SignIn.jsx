import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TermsModal } from '../Legal/TermsModal';

export function SignIn() {
  const { signInWithGoogle, isConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsTab, setTermsTab] = useState('terms');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    }
    setLoading(false);
  };

  const openTerms = (tab) => {
    setTermsTab(tab);
    setShowTerms(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl mb-6">
            <span className="text-white font-bold text-4xl">F</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Flowly</h1>
          <p className="text-white/60">Your all-in-one productivity workspace</p>
        </div>

        {/* Sign In Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl animate-fade-in">
          {!isConfigured ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Firebase Setup Required</h2>
              <p className="text-slate-500 text-sm mb-4">
                To enable authentication, you need to configure Firebase.
              </p>
              <div className="text-left p-4 bg-slate-50 rounded-xl text-sm">
                <p className="font-medium text-slate-700 mb-2">Setup steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Go to <span className="font-mono text-violet-600">console.firebase.google.com</span></li>
                  <li>Create a new project</li>
                  <li>Enable Google Authentication</li>
                  <li>Create a Firestore database</li>
                  <li>Copy your config to <span className="font-mono text-violet-600">src/firebase/config.js</span></li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
                <p className="text-slate-500">Sign in to continue to your workspace</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600 animate-fade-in">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-medium text-slate-700 hover:border-slate-300 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span className="group-hover:translate-x-0.5 transition-transform">
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  By signing in, you agree to our{' '}
                  <button
                    onClick={() => openTerms('terms')}
                    className="text-violet-500 hover:text-violet-600 underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    onClick={() => openTerms('privacy')}
                    className="text-violet-500 hover:text-violet-600 underline"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in">
          <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs text-white/80 font-medium">Daily Tasks</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-white/80 font-medium">Attendance</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xs text-white/80 font-medium">Cloud Sync</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-white/40 text-xs">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Private</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        initialTab={termsTab}
      />
    </div>
  );
}
