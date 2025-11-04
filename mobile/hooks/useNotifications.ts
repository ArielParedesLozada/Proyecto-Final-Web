import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getFixedMovementNotifications,
  markNotificationsAsRead,
  getUnreadNotificationsCount,
  FixedMovementNotification,
  getGoalNotifications,
  markGoalNotificationsAsRead,
  getGoalNotificationsUnreadCount,
  GoalNotification,
} from '@/services/notifications';

export type NotificationFilter = 'all' | 'unread';

export type UnifiedNotification = {
  id: string;
  type: 'fixed_movement' | 'goal';
  fixedMovement?: FixedMovementNotification;
  goal?: GoalNotification;
  created_at: string;
  read: boolean;
};

export function useNotifications() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fixedMovementNotifications, setFixedMovementNotifications] = useState<FixedMovementNotification[]>([]);
  const [goalNotifications, setGoalNotifications] = useState<GoalNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = useCallback(async (skipLoading = false, merge = false) => {
    if (!skipLoading && !merge) setLoading(true);
    try {
      const [fixedMovements, fixedMovementsCount, goals, goalsCount] = await Promise.all([
        getFixedMovementNotifications(100, true),
        getUnreadNotificationsCount(),
        getGoalNotifications(100, true),
        getGoalNotificationsUnreadCount(),
      ]);

      if (merge) {
        // Merge para fixed movements
        setFixedMovementNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifications = fixedMovements.filter((n) => !existingIds.has(n.id));

          if (newNotifications.length === 0) {
            const updatedMap = new Map(fixedMovements.map((n) => [n.id, n]));
            return prev.map((n) => updatedMap.get(n.id) || n);
          }

          const combined = [...newNotifications, ...prev];
          return combined.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        // Merge para goal notifications
        setGoalNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifications = goals.filter((n) => !existingIds.has(n.id));

          if (newNotifications.length === 0) {
            const updatedMap = new Map(goals.map((n) => [n.id, n]));
            return prev.map((n) => updatedMap.get(n.id) || n);
          }

          const combined = [...newNotifications, ...prev];
          return combined.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      } else {
        const sortedFixed = [...fixedMovements].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const sortedGoals = [...goals].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFixedMovementNotifications(sortedFixed);
        setGoalNotifications(sortedGoals);
      }

      setUnreadCount(fixedMovementsCount + goalsCount);
    } catch (error: any) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Timer para actualizar tiempo relativo
  useEffect(() => {
    setCurrentTime(Date.now());

    intervalRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Verificar nuevas notificaciones cuando se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      setCurrentTime(Date.now());
      loadNotifications(true, true);

      const checkInterval = setInterval(() => {
        loadNotifications(true, true);
      }, 15000);

      return () => {
        clearInterval(checkInterval);
      };
    }, [loadNotifications])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(true);
    setCurrentTime(Date.now());
  }, [loadNotifications]);

  const handleFixedMovementNotificationPress = useCallback(async (notification: FixedMovementNotification) => {
    if (!notification.read) {
      try {
        await markNotificationsAsRead([notification.id]);
        setFixedMovementNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    }
  }, []);

  const handleGoalNotificationPress = useCallback(async (notification: GoalNotification) => {
    if (!notification.read) {
      try {
        await markGoalNotificationsAsRead([notification.id]);
        setGoalNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadFixedIds = fixedMovementNotifications.filter((n) => !n.read).map((n) => n.id);
    const unreadGoalIds = goalNotifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadFixedIds.length === 0 && unreadGoalIds.length === 0) return;

    try {
      const promises = [];
      if (unreadFixedIds.length > 0) {
        promises.push(markNotificationsAsRead(unreadFixedIds));
      }
      if (unreadGoalIds.length > 0) {
        promises.push(markGoalNotificationsAsRead(unreadGoalIds));
      }

      await Promise.all(promises);

      setFixedMovementNotifications((prev) =>
        prev.map((n) => (unreadFixedIds.includes(n.id) ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      setGoalNotifications((prev) =>
        prev.map((n) => (unreadGoalIds.includes(n.id) ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, [fixedMovementNotifications, goalNotifications]);

  // Combinar y ordenar todas las notificaciones
  const allNotifications = useMemo(() => {
    const unified: UnifiedNotification[] = [
      ...fixedMovementNotifications.map((n) => ({
        id: `fm-${n.id}`,
        type: 'fixed_movement' as const,
        fixedMovement: n,
        created_at: n.created_at,
        read: n.read,
      })),
      ...goalNotifications.map((n) => ({
        id: `goal-${n.id}`,
        type: 'goal' as const,
        goal: n,
        created_at: n.created_at,
        read: n.read,
      })),
    ];

    return unified.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [fixedMovementNotifications, goalNotifications]);

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => {
      if (filter === 'unread') return !n.read;
      return true;
    });
  }, [allNotifications, filter]);

  return {
    loading,
    refreshing,
    filter,
    setFilter,
    unreadCount,
    currentTime,
    allNotifications,
    filteredNotifications,
    handleRefresh,
    handleFixedMovementNotificationPress,
    handleGoalNotificationPress,
    handleMarkAllAsRead,
  };
}

