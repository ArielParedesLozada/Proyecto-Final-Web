let NotificationsModule: typeof import('expo-notifications') | null = null;
let handlerInitialized = false;

async function getNotifications() {
  if (!NotificationsModule) {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('expo-notifications') && 
          (message.includes('Push notifications') || message.includes('removed from Expo Go'))) {
        return; 
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('expo-notifications') && 
          (message.includes('not fully supported') || message.includes('development build'))) {
        return; 
      }
      originalWarn.apply(console, args);
    };
    
    try {
      NotificationsModule = await import('expo-notifications');
      
      if (!handlerInitialized) {
        try {
          NotificationsModule.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowBanner: true,
              shouldShowList: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });
          handlerInitialized = true;
        } catch (error) {
        }
      }
    } finally {
      console.error = originalError;
      console.warn = originalWarn;
    }
  }
  return NotificationsModule;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const Notifications = await getNotifications();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    return false;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const Notifications = await getNotifications();
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (error) {
  }
}

