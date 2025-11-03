import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl, EmptyState } from '@/components/ui';
import { FixedMovementNotificationItem, GoalNotificationItem } from '@/components/notifications';
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

type FilterType = 'all' | 'unread';

type UnifiedNotification = {
  id: string; // String para permitir prefijos (fm-123, goal-456)
  type: 'fixed_movement' | 'goal';
  fixedMovement?: FixedMovementNotification;
  goal?: GoalNotification;
  created_at: string;
  read: boolean;
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fixedMovementNotifications, setFixedMovementNotifications] = useState<FixedMovementNotification[]>([]);
  const [goalNotifications, setGoalNotifications] = useState<GoalNotification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
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

  const handleFixedMovementNotificationPress = async (notification: FixedMovementNotification) => {
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
  };

  const handleGoalNotificationPress = async (notification: GoalNotification) => {
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
  };

  const handleMarkAllAsRead = async () => {
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
  };

  // Combinar y ordenar todas las notificaciones
  const allNotifications = useMemo(() => {
    const unified: UnifiedNotification[] = [
      ...fixedMovementNotifications.map((n) => ({
        id: `fm-${n.id}`, // Prefijo único para evitar conflictos de ID
        type: 'fixed_movement' as const,
        fixedMovement: n,
        created_at: n.created_at,
        read: n.read,
      })),
      ...goalNotifications.map((n) => ({
        id: `goal-${n.id}`, // Prefijo único para evitar conflictos de ID
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

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
            Notificaciones
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Mantente al día con tus movimientos y metas
          </Text>
        </View>

        <View style={styles.filters}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
            selectedColor={theme.colors.primary}
          >
            Todas ({allNotifications.length})
          </Chip>
          <Chip
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
            style={styles.chip}
            selectedColor={theme.colors.primary}
          >
            No leídas ({unreadCount})
          </Chip>
          {unreadCount > 0 && (
            <Chip
              onPress={handleMarkAllAsRead}
              style={[styles.chip, styles.markAllChip]}
              textStyle={{ color: theme.colors.primary }}
            >
              Marcar todas como leídas
            </Chip>
          )}
        </View>

        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              variant="default"
              title={filter === 'unread' ? 'No hay notificaciones no leídas' : 'No hay notificaciones'}
              subtitle={
                filter === 'unread'
                  ? 'Todas tus notificaciones han sido leídas'
                  : 'Las notificaciones de tus movimientos fijos y metas aparecerán aquí'
              }
            />
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => {
              if (notification.type === 'fixed_movement' && notification.fixedMovement) {
                return (
                  <FixedMovementNotificationItem
                    key={`fm-${notification.id}`}
                    notification={notification.fixedMovement}
                    currentTime={currentTime}
                    onPress={() => handleFixedMovementNotificationPress(notification.fixedMovement!)}
                  />
                );
              }
              if (notification.type === 'goal' && notification.goal) {
                return (
                  <GoalNotificationItem
                    key={`goal-${notification.id}`}
                    notification={notification.goal}
                    currentTime={currentTime}
                    onPress={() => handleGoalNotificationPress(notification.goal!)}
                  />
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 8,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  markAllChip: {
    borderWidth: 1,
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  notificationsList: {
    paddingVertical: 8,
  },
});

