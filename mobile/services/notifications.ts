import api from './api';

export interface FixedMovementNotification {
  id: number;
  user_id: number;
  transaction_id: number;
  fixed_movement_id: number;
  goal_id: number;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal_name: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: FixedMovementNotification[];
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export interface GoalNotification {
  id: number;
  user_id: number;
  goal_id: number;
  type: 'goal_created' | 'goal_completed';
  goal_name: string;
  suggested_savings?: number | null;
  savings_unit?: string | null;
  target_amount?: number | null;
  remaining_amount?: number | null;
  remaining_period?: string | null;
  completed_amount?: number | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalNotificationsResponse {
  success: boolean;
  data: GoalNotification[];
}

export async function getFixedMovementNotifications(
  limit: number = 50,
  all: boolean = false
): Promise<FixedMovementNotification[]> {
  try {
    const response = await api.get<NotificationsResponse>('/notifications/fixed-movements', {
      params: { limit, all },
    });
    return response.data.success ? response.data.data : [];
  } catch (error: any) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

export async function markNotificationsAsRead(
  ids: number[]
): Promise<boolean> {
  try {
    const response = await api.post('/notifications/fixed-movements/mark-read', { ids });
    return response.data.success || false;
  } catch (error: any) {
    console.error('Error al marcar notificaciones como leídas:', error);
    return false;
  }
}

export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const response = await api.get<UnreadCountResponse>('/notifications/fixed-movements/unread-count');
    return response.data.success ? response.data.count : 0;
  } catch (error: any) {
    console.error('Error al obtener conteo de notificaciones:', error);
    return 0;
  }
}

export async function getGoalNotifications(
  limit: number = 50,
  all: boolean = false
): Promise<GoalNotification[]> {
  try {
    const response = await api.get<GoalNotificationsResponse>('/notifications/goals', {
      params: { limit, all },
    });
    return response.data.success ? response.data.data : [];
  } catch (error: any) {
    console.error('Error al obtener notificaciones de metas:', error);
    return [];
  }
}

export async function markGoalNotificationsAsRead(
  ids: number[]
): Promise<boolean> {
  try {
    const response = await api.post('/notifications/goals/mark-read', { ids });
    return response.data.success || false;
  } catch (error: any) {
    console.error('Error al marcar notificaciones de metas como leídas:', error);
    return false;
  }
}

export async function getGoalNotificationsUnreadCount(): Promise<number> {
  try {
    const response = await api.get<UnreadCountResponse>('/notifications/goals/unread-count');
    return response.data.success ? response.data.count : 0;
  } catch (error: any) {
    console.error('Error al obtener conteo de notificaciones de metas:', error);
    return 0;
  }
}

