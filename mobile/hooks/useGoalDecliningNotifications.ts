import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getGoalNotifications,
  markGoalNotificationsAsRead,
  GoalNotification,
} from '../services/notifications';
import { notifyGoalDeclining } from '../utils/notifications/goalDeclining';
import { triggerRefresh } from '../utils/notifications/countManager';

// Tracking global de notificaciones procesadas para evitar duplicados entre múltiples instancias
const globalProcessedIds = new Set<number>();
let isChecking = false; // Flag para evitar verificaciones concurrentes

export function useGoalDecliningNotifications(
  interval: number = 15 * 1000, // 15 segundos para verificación más rápida
  enabled: boolean = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkNotifications = useCallback(async () => {
    if (!enabled) return;
    
    if (isChecking) {
      return;
    }

    isChecking = true;
    try {
      // Obtener solo notificaciones de declive no leídas
      const allNotifications = await getGoalNotifications(100, false);
      const decliningNotifications = allNotifications.filter(
        (n) => n.type === 'goal_declining' && !globalProcessedIds.has(n.id)
      );

      if (decliningNotifications.length > 0) {
        // Marcar como procesadas localmente para evitar duplicados
        decliningNotifications.forEach((n) => {
          globalProcessedIds.add(n.id);
        });

        // NO marcar como leídas automáticamente - solo mostrar la notificación local
        // Las notificaciones se marcarán como leídas cuando el usuario las toque en la pantalla
        for (const notification of decliningNotifications) {
          await notifyGoalDeclining(notification);
        }
        
        // Notificar al badge que debe actualizarse cuando hay nuevas notificaciones
        triggerRefresh();
      }
    } catch (error) {
      console.error('Error al verificar notificaciones de metas en declive:', error);
    } finally {
      isChecking = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    checkNotifications();

    intervalRef.current = setInterval(checkNotifications, interval);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkNotifications();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [enabled, interval, checkNotifications]);

  return {
    checkNotifications,
  };
}

