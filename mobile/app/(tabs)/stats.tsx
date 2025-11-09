import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import {
  StatsFilters,
  ChartCard,
  ChartPlaceholder,
  PieChartView,
  LineChartView,
  BarChartView,
} from '@/components/stats';
import { RefreshControl, Toast, EmptyState } from '@/components/ui';
import {
  getGoalsStatusDistribution,
  getMonthlyRealVsSuggested,
  getMonthlyCompletion,
  getCategoryDistribution,
  getMonthlyIncomeExpense,
  getTopGoalsProgress,
  StatusDistribution,
  MonthlyRealVsSuggested,
  MonthlyCompletion,
  CategoryDistribution,
  MonthlyIncomeExpense,
  TopGoalProgress,
} from '@/services/stats';
import { compareYMDDates } from '@/utils/date';

const CHART_COLORS = {
  indigo: '#6366F1',
  emerald: '#10B981',
  amber: '#F59E0B',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  red: '#EF4444',
};

export default function StatsScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const [statusData, setStatusData] = useState<StatusDistribution[]>([]);
  const [realVsSuggested, setRealVsSuggested] = useState<MonthlyRealVsSuggested[]>([]);
  const [monthlyCompletion, setMonthlyCompletion] = useState<MonthlyCompletion[]>([]);
  const [categoryDist, setCategoryDist] = useState<CategoryDistribution[]>([]);
  const [incomeExpense, setIncomeExpense] = useState<MonthlyIncomeExpense[]>([]);
  const [topGoals, setTopGoals] = useState<TopGoalProgress[]>([]);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const lastAppliedRangeRef = useRef<string>('');

  const validRange = useMemo(() => {
    const { start, end } = dateRange;
    if (!start && !end) return {};
    if (start && end && compareYMDDates(start, end) <= 0) return { start, end };
    return {};
  }, [dateRange]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const loadAll = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = { ...validRange };

      const [st, rvs, comp, cat, incExp, top] = await Promise.all([
        getGoalsStatusDistribution(params).catch(() => null),
        getMonthlyRealVsSuggested(params).catch(() => null),
        getMonthlyCompletion(params).catch(() => null),
        getCategoryDistribution(params).catch(() => null),
        getMonthlyIncomeExpense(params).catch(() => null),
        getTopGoalsProgress(params).catch(() => null),
      ]);

      if (st) setStatusData(Array.isArray(st) ? st : []);
      if (rvs) setRealVsSuggested(Array.isArray(rvs) ? rvs : []);
      if (comp) setMonthlyCompletion(Array.isArray(comp) ? comp : []);
      if (cat) setCategoryDist(Array.isArray(cat) ? cat : []);
      if (incExp) setIncomeExpense(Array.isArray(incExp) ? incExp : []);
      if (top) setTopGoals(Array.isArray(top) ? top : []);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      showToast('Error al cargar las estadísticas', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const { start, end } = dateRange;
    const key = `${start || ''}|${end || ''}`;

    if (start && end && compareYMDDates(start, end) > 0) {
      showToast('Rango de fechas inválido', 'error');
      setDateRange({ start: '', end: '' });
      return;
    }

    if (start && !end) {
      return;
    }

    if (!start && end) {
      return;
    }

    if (start && end) {
      if (lastAppliedRangeRef.current === key) {
        return;
      }
      lastAppliedRangeRef.current = key;
      loadAll(true);
      return;
    }

    if (lastAppliedRangeRef.current === '') {
      return;
    }
    lastAppliedRangeRef.current = '';
    loadAll(true);
  }, [dateRange]);

  const handleRefresh = () => {
    loadAll(true);
  };

  const handleClear = () => {
    setDateRange({ start: '', end: '' });
    showToast('Filtros limpiados', 'success');
  };

  const pieData = useMemo(() => {
    return (Array.isArray(statusData) ? statusData : []).map((x) => ({
      name: x.status,
      value: Number(x.value) || 0,
    }));
  }, [statusData]);

  const statusTotal = useMemo(() => {
    return pieData.reduce((acc, it) => acc + (it.value || 0), 0);
  }, [pieData]);

  const categoryData = useMemo(() => {
    return (Array.isArray(categoryDist) ? categoryDist : []).map((x) => ({
      name: x.category,
      value: Number(x.value) || 0,
    }));
  }, [categoryDist]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
            Estadísticas
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Visualiza el progreso de tus metas y tus hábitos de ahorro
          </Text>
        </View>

        <StatsFilters dateRange={dateRange} onDateRangeChange={setDateRange} onClear={handleClear} />

        {/* Estados de las metas */}
        <ChartCard
          title="Estados de las metas"
          subtitle="Distribución entre metas activas, completadas y vencidas"
          color={CHART_COLORS.indigo}
        >
          {loading ? (
            <ChartPlaceholder variant="pie" height={240} />
          ) : statusTotal === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas en el rango."
              />
            </View>
          ) : (
            <PieChartView data={pieData} />
          )}
        </ChartCard>

        {/* Ahorro real vs sugerido */}
        <ChartCard
          title="Ahorro real vs sugerido"
          subtitle="Comparación entre el ahorro real y el sugerido mensualmente"
          color={CHART_COLORS.emerald}
        >
          {loading ? (
            <ChartPlaceholder variant="line" height={240} />
          ) : realVsSuggested.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay movimientos en el rango."
              />
            </View>
          ) : (
            <LineChartView
              data={realVsSuggested as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={[
                { key: 'real', label: 'Real', color: CHART_COLORS.emerald },
                { key: 'suggested', label: 'Sugerido', color: CHART_COLORS.amber },
              ]}
              valueFormatter={(v) => `$${v.toLocaleString()}`}
              yAxisType="money"
            />
          )}
        </ChartCard>

        {/* Cumplimiento mensual */}
        <ChartCard
          title="Cumplimiento mensual"
          subtitle="Promedio de avance porcentual al cierre de cada mes"
          color={CHART_COLORS.amber}
        >
          {loading ? (
            <ChartPlaceholder variant="line" height={240} />
          ) : monthlyCompletion.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay información de cumplimiento en el rango."
              />
            </View>
          ) : (
            <LineChartView
              data={monthlyCompletion as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={[{ key: 'completion', label: 'Cumplimiento', color: CHART_COLORS.amber }]}
              valueFormatter={(v) => `${v}%`}
              yAxisType="percentage"
            />
          )}
        </ChartCard>

        {/* Categorías de metas */}
        <ChartCard
          title="Categorías de metas"
          subtitle="Distribución de metas por categoría de ahorro"
          color={CHART_COLORS.purple}
        >
          {loading ? (
            <ChartPlaceholder variant="pie" height={240} />
          ) : categoryData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas en el rango."
              />
            </View>
          ) : (
            <PieChartView data={categoryData} />
          )}
        </ChartCard>

        {/* Ingresos vs Gastos */}
        <ChartCard
          title="Ingresos vs Gastos"
          subtitle="Comparación mensual entre ingresos y gastos totales"
          color={CHART_COLORS.cyan}
        >
          {loading ? (
            <ChartPlaceholder variant="bar" height={240} />
          ) : incomeExpense.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay movimientos en el rango."
              />
            </View>
          ) : (
            <BarChartView
              data={incomeExpense as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={[
                { key: 'incomes', label: 'Ingresos', color: CHART_COLORS.emerald },
                { key: 'expenses', label: 'Gastos', color: CHART_COLORS.red },
              ]}
              labelKey="month"
              valueFormatter={(v) => `$${v.toLocaleString()}`}
              yAxisType="money"
            />
          )}
        </ChartCard>

        {/* Top 5 metas por avance */}
        <ChartCard
          title="Top 5 metas por avance"
          subtitle="Metas con mayor porcentaje de progreso en el período"
          color={CHART_COLORS.red}
        >
          {loading ? (
            <ChartPlaceholder variant="bar" height={240} />
          ) : topGoals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas destacadas en el rango."
              />
            </View>
          ) : (
            <BarChartView
              data={topGoals as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={[{ key: 'progress', label: 'Progreso', color: CHART_COLORS.indigo }]}
              labelKey="name"
              valueFormatter={(v) => `${v}%`}
            />
          )}
        </ChartCard>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 8,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  emptyContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

