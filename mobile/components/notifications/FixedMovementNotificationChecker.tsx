import { useEffect, useRef, useCallback } from 'react';
import { useFixedMovementNotifications } from '@/hooks/useFixedMovementNotifications';
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

  useEffect(() => {
    if (user) {
      globalCheckNotifications = checkNotifications;
      checkNotifications();
    } else {
      globalCheckNotifications = null;
    }

    return () => {
      globalCheckNotifications = null;
    };
  }, [user, checkNotifications]);

  return null; 
}
