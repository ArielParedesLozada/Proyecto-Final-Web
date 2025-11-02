import {
  calculateDaysDifference,
  calculateWeeksDifference,
  calculateMonthsDifference,
  getTodayYMD,
} from './date';

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

export async function notifySuggestedMonthlySavings(
  goalName: string,
  targetAmount: number,
  targetDate: string,
  currentAmount: number = 0
): Promise<void> {
  try {
    const today = getTodayYMD();
    const diasRestantes = calculateDaysDifference(today, targetDate);
    const montoRestante = targetAmount - currentAmount;
    
    if (diasRestantes <= 0 || montoRestante <= 0) {
      return;
    }
    
    let ahorroSugerido: number;
    let unidadTexto: string;
    let periodoTexto: string;
    
    if (diasRestantes <= 7) {
      ahorroSugerido = Math.ceil(montoRestante / diasRestantes);
      unidadTexto = 'diario';
      periodoTexto = `${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`;
    } else if (diasRestantes <= 30) {
      const semanasRestantes = calculateWeeksDifference(today, targetDate);
      ahorroSugerido = Math.ceil(montoRestante / semanasRestantes);
      unidadTexto = 'semanal';
      periodoTexto = `${Math.round(semanasRestantes)} ${Math.round(semanasRestantes) === 1 ? 'semana' : 'semanas'}`;
    } else {
      const mesesRestantes = calculateMonthsDifference(today, targetDate);
      ahorroSugerido = Math.ceil(montoRestante / mesesRestantes);
      unidadTexto = 'mensual';
      periodoTexto = `${Math.round(mesesRestantes)} ${Math.round(mesesRestantes) === 1 ? 'mes' : 'meses'}`;
    }
    
    const title = 'Meta de Ahorro Creada';
    const body = `${goalName}\nAhorro ${unidadTexto} sugerido: $${ahorroSugerido.toLocaleString()}\nMonto restante: $${montoRestante.toLocaleString()} en ${periodoTexto}`;
    
    await sendLocalNotification(title, body, {
      type: 'goal_created',
      goalName,
      suggestedSavings: ahorroSugerido,
      savingsUnit: unidadTexto,
    });
  } catch (error) {
    console.error('Error al calcular/enviar notificación de ahorro sugerido:', error);
  }
}

