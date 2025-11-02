import * as Notifications from 'expo-notifications';
import {
  calculateDaysDifference,
  calculateWeeksDifference,
  calculateMonthsDifference,
  getTodayYMD,
} from './date';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      console.warn('No se tienen permisos para mostrar notificaciones');
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
    console.error('Error al enviar notificación:', error);
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

