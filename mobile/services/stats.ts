import api from './api';

export interface DashboardSummary {
  totalAhorrado: number;
  metaMensualSugerida: number;
  metasActivas: number;
  progresoMensual: number;
  goalsActive: Array<{
    id: number;
    name: string;
    current: number;
    target: number;
  }>;
  goalsCompleted: Array<{
    id: number;
    name: string;
    finishedAt: string;
    deadline: string;
  }>;
}

export const getDashboardSummary = async (params: Record<string, any> = {}): Promise<DashboardSummary> => {
  try {
    const response = await api.get('/stats/dashboard/summary', { params });
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error al obtener dashboard summary:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al cargar el dashboard'
    );
  }
};

