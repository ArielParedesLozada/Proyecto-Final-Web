import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationCard from './NotificationCard';
import { GoalNotification } from '@/services/notifications';

export interface GoalNotificationItemProps {
  notification: GoalNotification;
  currentTime?: number;
  onPress?: () => void;
}

export default function GoalNotificationItem({
  notification,
  currentTime,
  onPress,
}: GoalNotificationItemProps) {
  const theme = useTheme();

  if (notification.type === 'goal_created') {
    const title = 'Meta de Ahorro Creada';
    const message = `${notification.goal_name}\nAhorro ${notification.savings_unit} sugerido: $${Number(notification.suggested_savings || 0).toLocaleString()}\nMonto restante: $${Number(notification.remaining_amount || 0).toLocaleString()} en ${notification.remaining_period || ''}`;

    return (
      <NotificationCard
        title={title}
        message={message}
        icon="savings"
        iconColor="#6366F1"
        read={notification.read}
        createdAt={notification.created_at}
        currentTime={currentTime}
        onPress={onPress}
      >
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              ${Number(notification.suggested_savings || 0).toLocaleString()} {notification.savings_unit}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {notification.remaining_period}
            </Text>
          </View>
        </View>
      </NotificationCard>
    );
  }

  // goal_completed
  const title = '¡Meta Completada!';
  const message = `Has alcanzado tu meta "${notification.goal_name}". ¡Felicitaciones!`;

  return (
    <NotificationCard
      title={title}
      message={message}
      icon="check-circle"
      iconColor="#10B981"
      read={notification.read}
      createdAt={notification.created_at}
      currentTime={currentTime}
      onPress={onPress}
    >
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="check-circle" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            ${Number(notification.completed_amount || 0).toLocaleString()} ahorrados
          </Text>
        </View>
      </View>
    </NotificationCard>
  );
}

const styles = StyleSheet.create({
  details: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

