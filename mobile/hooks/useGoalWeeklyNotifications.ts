import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  getGoalNotifications,
  GoalNotification,
} from '@/services/notifications';
import { notifyGoalWeeklyProgress } from '@/utils/notifications/goalWeeklyProgress';
import { triggerRefresh } from '@/utils/notifications/countManager';

const processedIds = new Set<number>();
let checking = false;

export function useGoalWeeklyNotifications(
  interval: number = 60 * 1000,
  enabled: boolean = true,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkNotifications = useCallback(async () => {
    if (!enabled || checking) {
      return;
    }

    checking = true;
    try {
      const allNotifications = await getGoalNotifications(100, false);
      const weeklyNotifications = allNotifications.filter(
        (n: GoalNotification) =>
          n.type === 'goal_weekly_progress' && !processedIds.has(n.id),
      );

      if (weeklyNotifications.length > 0) {
        weeklyNotifications.forEach((n) => processedIds.add(n.id));

        for (const notification of weeklyNotifications) {
          await notifyGoalWeeklyProgress(notification);
        }

        triggerRefresh();
      }
    } catch (error) {
      console.error('Error al verificar recordatorios semanales de metas:', error);
    } finally {
      checking = false;
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


