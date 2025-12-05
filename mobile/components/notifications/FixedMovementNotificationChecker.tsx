import { useEffect, useRef, useCallback } from 'react';
import { useFixedMovementNotifications } from '@/hooks/useFixedMovementNotifications';
import { useGoalDecliningNotifications } from '@/hooks/useGoalDecliningNotifications';
import { useGoalWeeklyNotifications } from '@/hooks/useGoalWeeklyNotifications';
import { useAuth } from '@/contexts/AuthContext';

let globalCheckNotifications: (() => Promise<void>) | null = null;

export function useCheckFixedMovementNotifications() {
  const checkNotifications = useCallback(async () => {
    if (globalCheckNotifications) {
      await globalCheckNotifications();
    }
  }, []); 

  return {
    checkNotifications,
  };
}

export default function FixedMovementNotificationChecker() {
  const { user } = useAuth();
  const { checkNotifications } = useFixedMovementNotifications(
    15 * 1000, 
    !!user 
  );
  
  const { checkNotifications: checkGoalDecliningNotifications } = useGoalDecliningNotifications(
    15 * 1000,
    !!user
  );

  const { checkNotifications: checkGoalWeeklyNotifications } = useGoalWeeklyNotifications(
    60 * 1000,
    !!user
  );

  useEffect(() => {
    if (user) {
      globalCheckNotifications = checkNotifications;
      checkNotifications();
      checkGoalDecliningNotifications();
      checkGoalWeeklyNotifications();
    } else {
      globalCheckNotifications = null;
    }

    return () => {
      globalCheckNotifications = null;
    };
  }, [user, checkNotifications, checkGoalDecliningNotifications, checkGoalWeeklyNotifications]);

  return null; 
}
