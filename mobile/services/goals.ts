import api from './api';

export interface Goal {
  id: number;
  name: string;
  category: string;
  description: string;
  target_amount: number;
  target_date: string;
  status: string;
  accumulated?: number;
  current_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GoalListResponse {
  message: string;
  data: Goal[];
  total: number;
  per_page: number;
  last_page: number;
  current_page: number;
}

export interface CreateGoalPayload {
  name: string;
  category: string;
  description?: string | null;
  target_amount: number;
  target_date: string;
}

export interface UpdateGoalPayload extends Partial<CreateGoalPayload> {
  status?: string;
}

export interface AddTransactionPayload {
  type: 'income' | 'expense';
  amount: number;
  is_fixed?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

// Categorías disponibles (convertir de UI a API)
const CATEGORY_MAP: Record<string, string> = {
  'Emergencia': 'emergency_fund',
  'Educación': 'education',
  'Vacaciones': 'vacation',
  'Hogar': 'home',
  'Vehículo': 'car',
  'Boda': 'wedding',
  'Negocio': 'business',
  'Jubilación': 'retirement',
  'Salud': 'health',
  'Otros': 'others',
};

const CATEGORY_REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

export const CATEGORIES = [
  'Emergencia',
  'Educación',
  'Vacaciones',
  'Hogar',
  'Vehículo',
  'Boda',
  'Negocio',
  'Jubilación',
  'Salud',
  'Otros',
];

// Listar metas
export async function listGoals(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  categoria?: string;
  estado?: string;
}): Promise<GoalListResponse> {
  try {
    const response = await api.get('/goals', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error al listar metas:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al cargar las metas'
    );
  }
}

// Obtener una meta
export async function getGoal(id: number): Promise<{ message: string; data: Goal }> {
  try {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener meta:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al cargar la meta'
    );
  }
}

// Crear meta
export async function createGoal(payload: CreateGoalPayload): Promise<{ message: string; data: Goal }> {
  try {
    // Convertir categoría UI a API
    const apiPayload = {
      ...payload,
      category: CATEGORY_MAP[payload.category] || payload.category || 'others',
      description: payload.description || null,
    };

    const response = await api.post('/goals', apiPayload);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear meta:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(`Errores de validación: ${errorMessages.join(', ')}`);
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al crear la meta'
    );
  }
}

// Actualizar meta
export async function updateGoal(
  id: number,
  payload: UpdateGoalPayload
): Promise<{ message: string; data: Goal }> {
  try {
    // Convertir categoría UI a API si existe
    const apiPayload = payload.category
      ? { ...payload, category: CATEGORY_MAP[payload.category] || payload.category }
      : payload;

    const response = await api.put(`/goals/${id}`, apiPayload);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar meta:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(`Errores de validación: ${errorMessages.join(', ')}`);
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al actualizar la meta'
    );
  }
}

// Eliminar meta
export async function deleteGoal(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al eliminar meta:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al eliminar la meta'
    );
  }
}

// Agregar transacción a una meta
export async function addTransactionToGoal(
  goalId: number,
  payload: AddTransactionPayload
): Promise<{ message: string; data: any }> {
  try {
    const response = await api.post(`/goals/${goalId}/transactions`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error al agregar transacción:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al agregar transacción'
    );
  }
}

// Helper para convertir categoría API a UI
export function getCategoryLabel(apiCategory: string): string {
  return CATEGORY_REVERSE_MAP[apiCategory] || apiCategory || 'Otros';
}

// Helper para calcular progreso
export function calculateProgress(current: number, target: number): number {
  return Math.min(100, Math.round(((current || 0) / Math.max(target, 1)) * 100));
}

