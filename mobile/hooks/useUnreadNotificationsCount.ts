import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUnreadNotificationsCount,
  getGoalNotificationsUnreadCount,
} from '@/services/notifications';
import { registerRefreshCallback } from '@/utils/notifications/countManager';

export function useUnreadNotificationsCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const [fixedCount, goalCount] = await Promise.all([
        getUnreadNotificationsCount(),
        getGoalNotificationsUnreadCount(),
      ]);
      setCount(fixedCount + goalCount);
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    const unregister = registerRefreshCallback(fetchCount);
    return unregister;
  }, [fetchCount]);

  useFocusEffect(
    useCallback(() => {
      fetchCount();

      intervalRef.current = setInterval(() => {
        fetchCount();
      }, 30000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [fetchCount])
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { count, loading, refresh: fetchCount };
}

