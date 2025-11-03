import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl, EmptyState } from '@/components/ui';
import { FixedMovementNotificationItem } from '@/components/notifications';
import {
  getFixedMovementNotifications,
  markNotificationsAsRead,
  getUnreadNotificationsCount,
  FixedMovementNotification,
} from '@/services/notifications';

type FilterType = 'all' | 'unread';

export default function NotificationsScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<FixedMovementNotification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now()); 
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = useCallback(async (skipLoading = false, merge = false) => {
    if (!skipLoading && !merge) setLoading(true);
    try {
      const [allNotifications, count] = await Promise.all([
        getFixedMovementNotifications(100, true),   
        getUnreadNotificationsCount(),
      ]);

      if (merge) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifications = allNotifications.filter((n) => !existingIds.has(n.id));
          
          if (newNotifications.length === 0) {
            const updatedMap = new Map(allNotifications.map((n) => [n.id, n]));
            return prev.map((n) => updatedMap.get(n.id) || n);
          }
          
          const combined = [...newNotifications, ...prev];
          return combined.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      } else {
        const sorted = [...allNotifications].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNotifications(sorted);
      }
      
      setUnreadCount(count);
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

  const handleNotificationPress = async (notification: FixedMovementNotification) => {
    if (!notification.read) {
      try {
        await markNotificationsAsRead([notification.id]);
        setNotifications((prev) =>
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
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await markNotificationsAsRead(unreadIds);
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
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
            Todas ({notifications.length})
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
                  : 'Las notificaciones de tus movimientos fijos aparecerán aquí'
              }
            />
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <FixedMovementNotificationItem
                key={notification.id}
                notification={notification}
                currentTime={currentTime}
                onPress={() => handleNotificationPress(notification)}
              />
            ))}
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

