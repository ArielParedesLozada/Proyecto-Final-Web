export const CHART_COLORS = {
  indigo: '#6366F1',
  emerald: '#10B981',
  amber: '#F59E0B',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  red: '#EF4444',
};

export const REAL_VS_SUGGESTED_KEYS: ReadonlyArray<{ key: string; label: string; color: string }> = [
  { key: 'real', label: 'Real', color: CHART_COLORS.emerald },
  { key: 'suggested', label: 'Sugerido', color: CHART_COLORS.amber },
];

export const COMPLETION_KEYS: ReadonlyArray<{ key: string; label: string; color: string }> = [
  { key: 'completion', label: 'Cumplimiento', color: CHART_COLORS.amber },
];

export const INCOME_EXPENSE_KEYS: ReadonlyArray<{ key: string; label: string; color: string }> = [
  { key: 'incomes', label: 'Ingresos', color: CHART_COLORS.emerald },
  { key: 'expenses', label: 'Gastos', color: CHART_COLORS.red },
];

export const TOP_GOALS_KEYS: ReadonlyArray<{ key: string; label: string; color: string }> = [
  { key: 'progress', label: 'Progreso', color: CHART_COLORS.indigo },
];

export const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
export const formatPercentage = (value: number) => `${value}%`;

