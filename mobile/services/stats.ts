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

export interface StatusDistribution {
  status: string;
  value: number;
}

export interface MonthlyRealVsSuggested {
  month: string;
  real: number;
  suggested: number;
}

export interface MonthlyCompletion {
  month: string;
  completion: number;
}

export interface CategoryDistribution {
  category: string;
  value: number;
}

export interface MonthlyIncomeExpense {
  month: string;
  incomes: number;
  expenses: number;
}

export interface TopGoalProgress {
  name: string;
  progress: number;
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

export const getGoalsStatusDistribution = async (params: Record<string, any> = {}): Promise<StatusDistribution[]> => {
  try {
    const response = await api.get('/stats/goals/status-distribution', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener distribución de estados:', error);
    throw error;
  }
};

export const getMonthlyRealVsSuggested = async (params: Record<string, any> = {}): Promise<MonthlyRealVsSuggested[]> => {
  try {
    const response = await api.get('/stats/monthly/real-vs-suggested', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener ahorro real vs sugerido:', error);
    throw error;
  }
};

export const getMonthlyCompletion = async (params: Record<string, any> = {}): Promise<MonthlyCompletion[]> => {
  try {
    const response = await api.get('/stats/monthly/completion', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener cumplimiento mensual:', error);
    throw error;
  }
};

export const getCategoryDistribution = async (params: Record<string, any> = {}): Promise<CategoryDistribution[]> => {
  try {
    const response = await api.get('/stats/categories/distribution', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener distribución por categoría:', error);
    throw error;
  }
};

export const getMonthlyIncomeExpense = async (params: Record<string, any> = {}): Promise<MonthlyIncomeExpense[]> => {
  try {
    const response = await api.get('/stats/monthly/income-expense', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener ingresos y gastos mensuales:', error);
    throw error;
  }
};

export const getTopGoalsProgress = async (params: Record<string, any> = {}): Promise<TopGoalProgress[]> => {
  try {
    const response = await api.get('/stats/goals/top-progress', { params });
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error al obtener top metas:', error);
    throw error;
  }
};
