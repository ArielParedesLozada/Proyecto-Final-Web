import { useEffect, useRef, useCallback } from 'react';
import { useFixedMovementNotifications } from '@/hooks/useFixedMovementNotifications';
import { useGoalDecliningNotifications } from '@/hooks/useGoalDecliningNotifications';
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

  useEffect(() => {
    if (user) {
      globalCheckNotifications = checkNotifications;
      checkNotifications();
      checkGoalDecliningNotifications();
    } else {
      globalCheckNotifications = null;
    }

    return () => {
      globalCheckNotifications = null;
    };
  }, [user, checkNotifications, checkGoalDecliningNotifications]);

  return null; 
}
