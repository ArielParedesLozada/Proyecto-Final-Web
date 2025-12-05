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

function formatPeriod(period: string | null | undefined): string {
  if (!period) return '';
  
  const decimalMatch = period.match(/(\d+\.\d+)/);
  if (decimalMatch) {
    const decimalValue = parseFloat(decimalMatch[1]);
    const roundedValue = Math.round(decimalValue);
    return period.replace(decimalMatch[1], roundedValue.toString());
  }
  
  return period;
}

export default function GoalNotificationItem({
  notification,
  currentTime,
  onPress,
}: GoalNotificationItemProps) {
  const theme = useTheme();

  if (notification.type === 'goal_created') {
    const formattedPeriod = formatPeriod(notification.remaining_period);
    const title = 'Meta de Ahorro Creada';
    const message = `${notification.goal_name}\nAhorro ${notification.savings_unit} sugerido: $${Number(notification.suggested_savings || 0).toLocaleString()}\nMonto restante: $${Number(notification.remaining_amount || 0).toLocaleString()} en ${formattedPeriod}`;

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
              {formattedPeriod}
            </Text>
          </View>
        </View>
      </NotificationCard>
    );
  }

  if (notification.type === 'goal_declining') {
    const title = 'Meta en Declive';
    const daysText = notification.days_until_deadline === 1 
      ? '1 día' 
      : `${notification.days_until_deadline} días`;
    const message = `Tu meta "${notification.goal_name}" está por debajo del progreso esperado.\nTienes ${daysText} para recuperar el ritmo.`;

    return (
      <NotificationCard
        title={title}
        message={message}
        icon="warning"
        iconColor="#F59E0B"
        read={notification.read}
        createdAt={notification.created_at}
        currentTime={currentTime}
        onPress={onPress}
      >
        <View style={styles.decliningDetails}>
          <View style={styles.decliningRow}>
            <MaterialIcons name="trending-down" size={16} color={theme.colors.error} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
              Déficit: ${Number(notification.deficit || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.decliningRow}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
              Actual: ${Number(notification.current_saved || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.decliningRow}>
            <MaterialIcons name="account-balance-wallet" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
              Esperado: ${Number(notification.expected_amount || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.decliningRow}>
            <MaterialIcons name="event" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, flex: 1 }} numberOfLines={1}>
              {daysText} restantes
            </Text>
          </View>
        </View>
      </NotificationCard>
    );
  }

  if (notification.type === 'goal_weekly_progress') {
    const progress = Number(notification.progress_percentage || 0);
    const currentSaved = Number(notification.current_saved || 0);
    const targetAmount = Number(notification.target_amount || 0);
    const remainingAmount =
      notification.remaining_amount !== undefined && notification.remaining_amount !== null
        ? Number(notification.remaining_amount)
        : Math.max(0, targetAmount - currentSaved);

    let encouragement =
      '¡Estás a punto de alcanzar tu meta! Mantén el ritmo y completa los últimos detalles.';
    if (progress < 50) {
      encouragement = '¡No te rindas! Aún estás a tiempo para alcanzar tu meta.';
    } else if (progress < 90) {
      encouragement = 'Vas por muy buen camino, sigue ahorrando.';
    }

    const message = `${encouragement}\nMeta: "${notification.goal_name}"`;

    return (
      <NotificationCard
        title="Recordatorio de Ahorro"
        message={message}
        icon="insights"
        iconColor="#3B82F6"
        read={notification.read}
        createdAt={notification.created_at}
        currentTime={currentTime}
        onPress={onPress}
      >
        <View style={styles.progressDetails}>
          <View style={styles.progressRow}>
            <MaterialIcons name="percent" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Progreso: {progress.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressRow}>
            <MaterialIcons name="savings" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Ahorrado: ${currentSaved.toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <MaterialIcons name="pie-chart" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Restante: ${remainingAmount.toLocaleString()}
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
  decliningDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
    width: '100%',
  },
  decliningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
    flexShrink: 0,
    flexBasis: '48%',
    maxWidth: '48%',
  },
  progressDetails: {
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

