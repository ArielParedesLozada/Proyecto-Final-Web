import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { RefreshControl, EmptyState } from '@/components/ui';
import { NotificationsFilters, NotificationsList } from '@/components/notifications';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const {
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
  } = useNotifications();

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

        <NotificationsFilters
          filter={filter}
          onFilterChange={setFilter}
          allCount={allNotifications.length}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

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
          <NotificationsList
            notifications={filteredNotifications}
            currentTime={currentTime}
            onFixedMovementPress={handleFixedMovementNotificationPress}
            onGoalPress={handleGoalNotificationPress}
          />
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
  emptyContainer: {
    paddingTop: 32,
  },
});
