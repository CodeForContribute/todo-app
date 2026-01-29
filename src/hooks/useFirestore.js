import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, isConfigured } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function for exponential backoff retry
async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = RETRY_DELAY) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.code !== 'permission-denied') {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Hook for todos data
export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'data', 'todos');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTodos(docSnap.data() || {});
      } else {
        setTodos({});
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error fetching todos:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateTodos = useCallback(async (newTodos) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'todos');
    try {
      await retryWithBackoff(() => setDoc(docRef, newTodos));
      setError(null);
    } catch (err) {
      console.error('Error updating todos:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  return [todos, updateTodos, loading, error];
}

// Hook for attendance data
export function useAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'data', 'attendance');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAttendance(docSnap.data() || {});
      } else {
        setAttendance({});
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error fetching attendance:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateAttendance = useCallback(async (newAttendance) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'attendance');
    try {
      await retryWithBackoff(() => setDoc(docRef, newAttendance));
      setError(null);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  return [attendance, updateAttendance, loading, error];
}

// Hook for office config
export function useOfficeConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'data', 'officeConfig');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        setConfig(null);
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error fetching office config:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateConfig = useCallback(async (newConfig) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'officeConfig');
    try {
      if (newConfig === null) {
        await retryWithBackoff(() => deleteDoc(docRef));
      } else {
        await retryWithBackoff(() => setDoc(docRef, newConfig));
      }
      setError(null);
    } catch (err) {
      console.error('Error updating office config:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  return [config, updateConfig, loading, error];
}

// Generic hook for any user data with retry logic
export function useUserData(dataKey, defaultValue = null) {
  const { user } = useAuth();
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'data', dataKey);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        setData(defaultValueRef.current);
      }
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(`Error fetching ${dataKey}:`, err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dataKey]);

  const updateData = useCallback(async (newData) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', dataKey);
    try {
      await retryWithBackoff(() => setDoc(docRef, newData));
      setError(null);
    } catch (err) {
      console.error(`Error updating ${dataKey}:`, err);
      setError(err.message);
      throw err;
    }
  }, [user, dataKey]);

  return [data, updateData, loading, error];
}
