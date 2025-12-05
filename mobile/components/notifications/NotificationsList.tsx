import React from 'react';
import { View, StyleSheet } from 'react-native';
import FixedMovementNotificationItem from './FixedMovementNotificationItem';
import GoalNotificationItem from './GoalNotificationItem';
import { UnifiedNotification } from '@/hooks/useNotifications';
import { FixedMovementNotification, GoalNotification } from '@/services/notifications';

export interface NotificationsListProps {
  notifications: UnifiedNotification[];
  currentTime: number;
  onNotificationPress: (notification: FixedMovementNotification | GoalNotification, type: 'fixed_movement' | 'goal') => void;
}

export default function NotificationsList({
  notifications,
  currentTime,
  onNotificationPress,
}: NotificationsListProps) {
  return (
    <View style={styles.container}>
      {notifications.map((notification) => {
        if (notification.type === 'fixed_movement' && notification.fixedMovement) {
          return (
            <FixedMovementNotificationItem
              key={notification.id}
              notification={notification.fixedMovement}
              currentTime={currentTime}
              onPress={() => onNotificationPress(notification.fixedMovement!, 'fixed_movement')}
            />
          );
        }
        if (notification.type === 'goal' && notification.goal) {
          return (
            <GoalNotificationItem
              key={notification.id}
              notification={notification.goal}
              currentTime={currentTime}
              onPress={() => onNotificationPress(notification.goal!, 'goal')}
            />
          );
        }
        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});

