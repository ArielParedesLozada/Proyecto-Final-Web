import { sendLocalNotification } from './core';
import {
  calculateDaysDifference,
  calculateWeeksDifference,
  calculateMonthsDifference,
  getTodayYMD,
} from '../date';

/**
 * Notificación cuando se completa una meta de ahorro
 */
export async function notifyGoalCompleted(
  goalName: string,
  goalId: number
): Promise<void> {
  try {
    await sendLocalNotification(
      '🎉 ¡Meta Completada!',
      `Has alcanzado tu meta "${goalName}". ¡Felicitaciones!`,
      {
        type: 'goal_completed',
        goalId,
        goalName,
      }
    );
  } catch (error) {
    console.warn('No se pudo enviar notificación de meta completada:', error);
  }
}

/**
 * Notificación con el ahorro sugerido (diario, semanal o mensual) al crear una meta
 */
export async function notifySuggestedSavings(
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

