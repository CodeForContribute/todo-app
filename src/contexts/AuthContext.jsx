import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '../firebase/config';

const AuthContext = createContext(null);

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// Token expiration buffer (5 minutes before actual expiry)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;
// Default token lifetime (1 hour - Google OAuth tokens typically last 1 hour)
const DEFAULT_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarToken, setCalendarToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const sessionTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Clear sensitive data from memory
  const clearSensitiveData = useCallback(() => {
    setCalendarToken(null);
    setTokenExpiry(null);
  }, []);

  // Reset session timeout on activity
  const resetSessionTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    if (user) {
      sessionTimeoutRef.current = setTimeout(async () => {
        // Auto sign out on session timeout
        console.warn('Session timeout - signing out');
        clearSensitiveData();
        await firebaseSignOut(auth).catch(() => {});
      }, SESSION_TIMEOUT_MS);
    }
  }, [user, clearSensitiveData]);

  // Track user activity for session timeout
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Throttle activity updates to once per minute
      if (Date.now() - lastActivityRef.current > 60000) {
        resetSessionTimeout();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize session timeout
    resetSessionTimeout();

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [user, resetSessionTimeout]);

  // Check if token is expired or about to expire
  const isTokenValid = useCallback(() => {
    if (!calendarToken || !tokenExpiry) return false;
    return Date.now() < (tokenExpiry - TOKEN_EXPIRY_BUFFER_MS);
  }, [calendarToken, tokenExpiry]);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);

      // Clear tokens when user signs out
      if (!authUser) {
        clearSensitiveData();
      }
    });

    return () => unsubscribe();
  }, [clearSensitiveData]);

  // Store token with expiration
  const storeToken = useCallback((token) => {
    if (token) {
      setCalendarToken(token);
      // Set expiry time (default 1 hour from now)
      setTokenExpiry(Date.now() + DEFAULT_TOKEN_LIFETIME_MS);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      throw new Error('Firebase is not configured');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Check if we got calendar access
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        storeToken(credential.accessToken);
      }
      resetSessionTimeout();
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const requestCalendarAccess = async () => {
    if (!isConfigured || !user) {
      throw new Error('Not authenticated');
    }
    try {
      // Create a new provider with calendar scope
      const calendarProvider = new GoogleAuthProvider();
      calendarProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
      calendarProvider.setCustomParameters({
        prompt: 'consent'
      });

      const result = await signInWithPopup(auth, calendarProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        storeToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Calendar access error:', error);
      throw error;
    }
  };

  const getCalendarAccessToken = async () => {
    // Return cached token if still valid
    if (isTokenValid()) {
      return calendarToken;
    }

    // Clear expired token
    clearSensitiveData();

    // Try to get a fresh token
    try {
      return await requestCalendarAccess();
    } catch {
      return null;
    }
  };

  const signOut = async () => {
    if (!isConfigured) return;
    try {
      clearSensitiveData();
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isConfigured,
    signInWithGoogle,
    signOut,
    getCalendarAccessToken,
    requestCalendarAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
