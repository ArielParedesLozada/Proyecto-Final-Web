import { sendLocalNotification } from './core';
import { GoalNotification } from '../../services/notifications';

export async function notifyGoalWeeklyProgress(
  notification: GoalNotification,
): Promise<void> {
  try {
    const progress = Number(notification.progress_percentage || 0);
    const currentSaved = Number(notification.current_saved || 0);
    const targetAmount = Number(notification.target_amount || 0);
    const remainingAmount =
      notification.remaining_amount !== undefined && notification.remaining_amount !== null
        ? Number(notification.remaining_amount)
        : Math.max(0, targetAmount - currentSaved);

    let body =
      '¡Estás a punto de alcanzar tu meta! Mantén el ritmo y completa los últimos detalles.';
    if (progress < 50) {
      body = '¡No te rindas! Aún estás a tiempo para alcanzar tu meta.';
    } else if (progress < 90) {
      body = 'Vas por muy buen camino, sigue ahorrando.';
    }

    body += `\nProgreso: ${progress.toFixed(1)}%\nRestante: $${remainingAmount.toLocaleString()}`;

    await sendLocalNotification('Recordatorio de Ahorro', body, {
      type: 'goal_weekly_progress',
      notificationId: notification.id,
      goalId: notification.goal_id,
      goalName: notification.goal_name,
      progressPercentage: progress,
    });
  } catch (error) {
    console.warn('No se pudo enviar notificación semanal de meta:', error);
  }
}


