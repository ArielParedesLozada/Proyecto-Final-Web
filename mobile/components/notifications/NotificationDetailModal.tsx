import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import Modal from '../ui/Modal';
import { FixedMovementNotification, GoalNotification } from '@/services/notifications';

export interface NotificationDetailModalProps {
  visible: boolean;
  onDismiss: () => void;
  notification: FixedMovementNotification | GoalNotification | null;
  type: 'fixed_movement' | 'goal';
  onViewTransactions?: (goalId: number, goalName: string) => void;
}

export default function NotificationDetailModal({
  visible,
  onDismiss,
  notification,
  type,
  onViewTransactions,
}: NotificationDetailModalProps) {
  const theme = useTheme();

  if (!notification) return null;

  const getFullMessage = () => {
    if (type === 'fixed_movement') {
      const fm = notification as FixedMovementNotification;
      const typeLabel = fm.type === 'income' ? 'Ingreso' : 'Gasto';
      const frequencyMap: Record<string, string> = {
        daily: 'diario',
        weekly: 'semanal',
        monthly: 'mensual',
      };
      const frequencyLabel = frequencyMap[fm.frequency] || fm.frequency;

      return `Se registró un ${typeLabel.toLowerCase()} fijo de $${Number(fm.amount).toLocaleString()} para tu meta "${fm.goal_name}".

Detalles:
• Tipo: ${typeLabel}
• Monto: $${Number(fm.amount).toLocaleString()}
• Frecuencia: ${frequencyLabel}
• Meta: ${fm.goal_name}`;
    }

    const gn = notification as GoalNotification;
    if (gn.type === 'goal_created') {
      return `${gn.goal_name}

Ahorro ${gn.savings_unit} sugerido: $${Number(gn.suggested_savings || 0).toLocaleString()}

Detalles:
• Monto objetivo: $${Number(gn.target_amount || 0).toLocaleString()}
• Monto restante: $${Number(gn.remaining_amount || 0).toLocaleString()}
• Periodo restante: ${gn.remaining_period || ''}
• Ahorro ${gn.savings_unit} sugerido: $${Number(gn.suggested_savings || 0).toLocaleString()}`;
    }

    if (gn.type === 'goal_declining') {
      const daysText = gn.days_until_deadline === 1 
        ? '1 día' 
        : `${gn.days_until_deadline} días`;
      return `Tu meta "${gn.goal_name}" está por debajo del progreso esperado.

Detalles:
• Monto objetivo: $${Number(gn.target_amount || 0).toLocaleString()}
• Ahorrado actual: $${Number(gn.current_saved || 0).toLocaleString()}
• Esperado al día de hoy: $${Number(gn.expected_amount || 0).toLocaleString()}
• Déficit: $${Number(gn.deficit || 0).toLocaleString()}
• Progreso: ${Number(gn.progress_percentage || 0).toFixed(1)}%
• Tiempo restante: ${daysText}

Tu progreso está por debajo de lo esperado. Considera aumentar tus aportes para alcanzar tu meta a tiempo.`;
    }

    if (gn.type === 'goal_weekly_progress') {
      const progress = Number(gn.progress_percentage || 0);
      const currentSaved = Number(gn.current_saved || 0);
      const targetAmount = Number(gn.target_amount || 0);
      const remainingAmount =
        gn.remaining_amount !== undefined && gn.remaining_amount !== null
          ? Number(gn.remaining_amount)
          : Math.max(0, targetAmount - currentSaved);

      let encouragement =
        '¡Estás a punto de alcanzar tu meta! Mantén el ritmo y completa los últimos detalles.';
      if (progress < 50) {
        encouragement = '¡No te rindas! Aún estás a tiempo para alcanzar tu meta.';
      } else if (progress < 90) {
        encouragement = 'Vas por muy buen camino, sigue ahorrando.';
      }

      return `Meta: "${gn.goal_name}"

${encouragement}

Detalles:
• Progreso: ${progress.toFixed(1)}%
• Ahorrado: $${currentSaved.toLocaleString()}
• Restante: $${remainingAmount.toLocaleString()}
• Objetivo: $${targetAmount.toLocaleString()}`;
    }

    return `Has alcanzado tu meta "${gn.goal_name}". ¡Felicitaciones!

Detalles:
• Monto completado: $${Number(gn.completed_amount || 0).toLocaleString()}
• Meta: ${gn.goal_name}`;
  };

  const getTitle = () => {
    if (type === 'fixed_movement') {
      const fm = notification as FixedMovementNotification;
      return `${fm.type === 'income' ? 'Ingreso' : 'Gasto'} fijo registrado`;
    }

    const gn = notification as GoalNotification;
    if (gn.type === 'goal_created') {
      return 'Meta de Ahorro Creada';
    }
    if (gn.type === 'goal_declining') {
      return 'Meta en Declive';
    }
    if (gn.type === 'goal_weekly_progress') {
      return 'Recordatorio de Ahorro';
    }
    return '¡Meta Completada!';
  };

  const goalId = type === 'fixed_movement' 
    ? (notification as FixedMovementNotification).goal_id 
    : (notification as GoalNotification).goal_id;

  const goalName = type === 'fixed_movement'
    ? (notification as FixedMovementNotification).goal_name
    : (notification as GoalNotification).goal_name;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      title={getTitle()}
      cancelable={true}
      primaryAction={
        onViewTransactions && goalId
          ? {
              label: 'Ver Movimientos',
              onPress: () => {
                onDismiss();
                onViewTransactions(goalId, goalName);
              },
            }
          : undefined
      }
      secondaryAction={{
        label: 'Cerrar',
        onPress: onDismiss,
      }}
    >
      <View style={styles.content}>
        <Text
          variant="bodyLarge"
          style={[styles.message, { color: theme.colors.onSurface }]}
        >
          {getFullMessage()}
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: 100,
  },
  message: {
    lineHeight: 24,
  },
});

