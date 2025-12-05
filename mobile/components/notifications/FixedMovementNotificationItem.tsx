import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationCard from './NotificationCard';
import { FixedMovementNotification } from '@/services/notifications';

export interface FixedMovementNotificationItemProps {
  notification: FixedMovementNotification;
  currentTime?: number;
  onPress?: () => void;
}

export default function FixedMovementNotificationItem({
  notification,
  currentTime,
  onPress,
}: FixedMovementNotificationItemProps) {
  const theme = useTheme();

  const getTypeIcon = (): keyof typeof MaterialIcons.glyphMap => {
    return notification.type === 'income' ? 'arrow-upward' : 'arrow-downward';
  };

  const getTypeColor = (): string => {
    return notification.type === 'income' ? '#10B981' : '#EF4444';
  };

  const getTypeLabel = (): string => {
    return notification.type === 'income' ? 'Ingreso' : 'Gasto';
  };

  const getFrequencyLabel = (): string => {
    const frequencyMap: Record<string, string> = {
      daily: 'diario',
      weekly: 'semanal',
      monthly: 'mensual',
    };
    return frequencyMap[notification.frequency] || notification.frequency;
  };

  const title = `${getTypeLabel()} fijo registrado`;
  const message = `Se registró un ${getTypeLabel().toLowerCase()} de $${Number(notification.amount).toLocaleString()} para la meta "${notification.goal_name}" (${getFrequencyLabel()})`;

  return (
    <NotificationCard
      title={title}
      message={message}
      icon={getTypeIcon()}
      iconColor={getTypeColor()}
      read={notification.read}
      createdAt={notification.created_at}
      currentTime={currentTime}
      onPress={onPress}
    >
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            ${Number(notification.amount).toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="repeat" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {getFrequencyLabel()}
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

