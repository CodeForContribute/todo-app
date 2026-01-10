import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, isConfigured } from '../firebase/config';

const AuthContext = createContext(null);

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
  const [calendarAccessToken, setCalendarAccessToken] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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
        setCalendarAccessToken(credential.accessToken);
      }
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
        setCalendarAccessToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Calendar access error:', error);
      throw error;
    }
  };

  const getCalendarAccessToken = async () => {
    if (calendarAccessToken) {
      return calendarAccessToken;
    }
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
