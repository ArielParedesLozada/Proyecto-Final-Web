import { sendLocalNotification } from './core';
import { GoalNotification } from '../../services/notifications';

export async function notifyGoalDeclining(
  notification: GoalNotification
): Promise<void> {
  try {
    const daysText = notification.days_until_deadline === 1 
      ? '1 día' 
      : `${notification.days_until_deadline} días`;
    
    const deficitText = `$${Number(notification.deficit || 0).toLocaleString()}`;
    
    const title = '⚠️ Meta en Declive';
    const body = `Tu meta "${notification.goal_name}" está por debajo del progreso esperado.\nDéficit: ${deficitText}\nTienes ${daysText} para recuperar el ritmo.`;

    await sendLocalNotification(title, body, {
      type: 'goal_declining',
      notificationId: notification.id,
      goalId: notification.goal_id,
      goalName: notification.goal_name,
      currentSaved: notification.current_saved,
      expectedAmount: notification.expected_amount,
      deficit: notification.deficit,
      daysUntilDeadline: notification.days_until_deadline,
    });
  } catch (error) {
    console.warn('No se pudo enviar notificación de meta en declive:', error);
  }
}

