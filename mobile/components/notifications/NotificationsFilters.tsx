import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { NotificationFilter } from '@/hooks/useNotifications';

export interface NotificationsFiltersProps {
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  allCount: number;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export default function NotificationsFilters({
  filter,
  onFilterChange,
  allCount,
  unreadCount,
  onMarkAllAsRead,
}: NotificationsFiltersProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Chip
        selected={filter === 'all'}
        onPress={() => onFilterChange('all')}
        style={styles.chip}
        selectedColor={theme.colors.primary}
      >
        Todas ({allCount})
      </Chip>
      <Chip
        selected={filter === 'unread'}
        onPress={() => onFilterChange('unread')}
        style={styles.chip}
        selectedColor={theme.colors.primary}
      >
        No leídas ({unreadCount})
      </Chip>
      {unreadCount > 0 && (
        <Chip
          onPress={onMarkAllAsRead}
          style={[styles.chip, styles.markAllChip]}
          textStyle={{ color: theme.colors.primary }}
        >
          Marcar todas como leídas
        </Chip>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});

