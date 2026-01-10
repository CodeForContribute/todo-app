import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, isConfigured } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Hook for todos data
export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState({});
  const [loading, setLoading] = useState(true);

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
    }, (error) => {
      console.error('Error fetching todos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateTodos = useCallback(async (newTodos) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'todos');
    try {
      await setDoc(docRef, newTodos);
    } catch (error) {
      console.error('Error updating todos:', error);
    }
  }, [user]);

  return [todos, updateTodos, loading];
}

// Hook for attendance data
export function useAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

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
    }, (error) => {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateAttendance = useCallback(async (newAttendance) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'attendance');
    try {
      await setDoc(docRef, newAttendance);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  }, [user]);

  return [attendance, updateAttendance, loading];
}

// Hook for office config
export function useOfficeConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

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
    }, (error) => {
      console.error('Error fetching office config:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateConfig = useCallback(async (newConfig) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'officeConfig');
    try {
      if (newConfig === null) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, newConfig);
      }
    } catch (error) {
      console.error('Error updating office config:', error);
    }
  }, [user]);

  return [config, updateConfig, loading];
}

// Generic hook for any user data
export function useUserData(dataKey, defaultValue = null) {
  const { user } = useAuth();
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

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
        setData(defaultValue);
      }
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${dataKey}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, dataKey]);

  const updateData = useCallback(async (newData) => {
    if (!user || !isConfigured) return;

    const docRef = doc(db, 'users', user.uid, 'data', dataKey);
    try {
      await setDoc(docRef, newData);
    } catch (error) {
      console.error(`Error updating ${dataKey}:`, error);
    }
  }, [user, dataKey]);

  return [data, updateData, loading];
}
