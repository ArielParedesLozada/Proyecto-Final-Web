import api from './api';

export interface FixedMovement {
  id: number;
  goal_id: number;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFixedMovementPayload {
  goal_id: number;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  apply_now?: boolean;
}

export interface UpdateFixedMovementPayload {
  amount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  reseed_next_run?: boolean;
}

// Listar reglas fijas
export async function listFixedMovements(
  goalId: number,
  params?: { type?: 'income' | 'expense' }
): Promise<{ data: FixedMovement[] }> {
  try {
    const apiParams: any = {
      goal_id: goalId,
    };
    
    // Agregar el filtro de tipo si existe
    if (params?.type) {
      apiParams.type = params.type;
    }
    
    const response = await api.get('/fixed-movements', {
      params: apiParams,
    });
    
    // Filtrar por tipo en el frontend también como respaldo
    let data = response.data?.data || [];
    if (params?.type && Array.isArray(data)) {
      data = data.filter((r: FixedMovement) => r.type === params.type);
    }
    
    return { data };
  } catch (error: any) {
    console.error('Error al listar reglas fijas:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Error al listar reglas fijas'
    );
  }
}

// Actualizar regla fija
export async function updateFixedMovement(
  id: number,
  payload: UpdateFixedMovementPayload
): Promise<{ message: string; data: FixedMovement }> {
  try {
    const response = await api.put(`/fixed-movements/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar regla fija:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Error al actualizar regla fija'
    );
  }
}

// Crear regla fija
export async function createFixedMovement(
  payload: CreateFixedMovementPayload
): Promise<{ data: FixedMovement }> {
  try {
    const response = await api.post('/fixed-movements', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear regla fija:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Error al crear regla fija'
    );
  }
}

// Eliminar regla fija
export async function deleteFixedMovement(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/fixed-movements/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al eliminar regla fija:', error);
    throw new Error(
      error.response?.data?.message || error.message || 'Error al eliminar regla fija'
    );
  }
}

