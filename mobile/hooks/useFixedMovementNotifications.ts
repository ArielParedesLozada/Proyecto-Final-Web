import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getFixedMovementNotifications,
  markNotificationsAsRead,
  FixedMovementNotification,
} from '../services/notifications';
import {
  notifyFixedMovement,
  notifyMultipleFixedMovements,
} from '../utils/notifications/fixedMovements';

const globalProcessedIds = new Set<number>();
let isChecking = false; 


export function useFixedMovementNotifications(
  interval: number = 15 * 1000, 
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
      const notifications = await getFixedMovementNotifications();
      
      const newNotifications = notifications.filter(
        (n) => !globalProcessedIds.has(n.id)
      );

      if (newNotifications.length > 0) {
        newNotifications.forEach((n) => {
          globalProcessedIds.add(n.id);
        });

        const idsToMark = newNotifications.map((n) => n.id);
        await markNotificationsAsRead(idsToMark);

        if (newNotifications.length === 1) {
          await notifyFixedMovement(newNotifications[0]);
        } else {
          await notifyMultipleFixedMovements(newNotifications);
        }
      }
    } catch (error) {
      console.error('Error al verificar notificaciones de movimientos fijos:', error);
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

