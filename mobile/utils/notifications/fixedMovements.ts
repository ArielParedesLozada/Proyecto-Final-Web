import { sendLocalNotification } from './core';
import { FixedMovementNotification } from '../../services/notifications';

function getFrequencyText(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    daily: 'diario',
    weekly: 'semanal',
    monthly: 'mensual',
  };
  return frequencyMap[frequency] || frequency;
}

function getTypeEmoji(type: 'income' | 'expense'): string {
  return type === 'income' ? '💰' : '💸';
}

export async function notifyFixedMovement(
  notification: FixedMovementNotification
): Promise<void> {
  try {
    const frequencyText = getFrequencyText(notification.frequency);
    const emoji = getTypeEmoji(notification.type);
    const typeText = notification.type === 'income' ? 'Ingreso' : 'Gasto';
    const amountText = `$${notification.amount.toLocaleString()}`;

    const title = `${emoji} Movimiento Fijo ${typeText}`;
    const body = `${amountText} registrado en "${notification.goal_name}"\nFrecuencia: ${frequencyText}`;

    await sendLocalNotification(title, body, {
      type: 'fixed_movement',
      notificationId: notification.id,
      transactionId: notification.transaction_id,
      goalId: notification.goal_id,
      fixedMovementId: notification.fixed_movement_id,
      amount: notification.amount,
      movementType: notification.type,
      frequency: notification.frequency,
      goalName: notification.goal_name,
    });
  } catch (error) {
    console.warn('No se pudo enviar notificación de movimiento fijo:', error);
  }
}

export async function notifyMultipleFixedMovements(
  notifications: FixedMovementNotification[]
): Promise<void> {
  if (notifications.length === 0) return;

  try {
    if (notifications.length === 1) {
      await notifyFixedMovement(notifications[0]);
      return;
    }

    const incomeCount = notifications.filter(n => n.type === 'income').length;
    const expenseCount = notifications.filter(n => n.type === 'expense').length;

    let title = '💰 Movimientos Fijos Registrados';
    let body = `Se han registrado ${notifications.length} movimientos fijos`;

    if (incomeCount > 0 && expenseCount > 0) {
      body += `:\n• ${incomeCount} ingreso${incomeCount > 1 ? 's' : ''}\n• ${expenseCount} gasto${expenseCount > 1 ? 's' : ''}`;
    } else if (incomeCount > 0) {
      body += `:\n• ${incomeCount} ingreso${incomeCount > 1 ? 's' : ''}`;
    } else if (expenseCount > 0) {
      body += `:\n• ${expenseCount} gasto${expenseCount > 1 ? 's' : ''}`;
    }

    await sendLocalNotification(title, body, {
      type: 'fixed_movements_batch',
      count: notifications.length,
      notificationIds: notifications.map(n => n.id),
    });
  } catch (error) {
    console.warn('No se pudo enviar notificación de movimientos fijos:', error);
  }
}

