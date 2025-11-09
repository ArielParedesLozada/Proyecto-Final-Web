import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import {
  StatsFilters,
  ChartCard,
  ChartPlaceholder,
  PieChartView,
  LineChartView,
  BarChartView,
} from '@/components/stats';
import { RefreshControl, Toast, EmptyState, LoadingState } from '@/components/ui';
import { CHART_COLORS, formatCurrency, formatPercentage } from '@/constants/stats';
import { useStatsScreen } from '@/hooks/useStatsScreen';

export default function StatsScreen() {
  const theme = useTheme();
  const {
    loading,
    isRefreshing,
    dateRange,
    setDateRange,
    handleRefresh,
    handleClear,
    toast,
    charts,
  } = useStatsScreen();

  const {
    status,
    categories,
    realVsSuggested,
    monthlyCompletion,
    incomeExpense,
    topGoals,
  } = charts;

  if (loading && !isRefreshing) {
    return <LoadingState message="Cargando estadísticas..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
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

        <ChartCard
          title="Estados de las metas"
          subtitle="Distribución entre metas activas, completadas y vencidas"
          color={CHART_COLORS.indigo}
        >
          {loading ? (
            <ChartPlaceholder variant="pie" height={240} />
          ) : status.statusTotal === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas en el rango."
              />
            </View>
          ) : (
            <PieChartView data={status.pieData} />
          )}
        </ChartCard>

        <ChartCard
          title="Ahorro real vs sugerido"
          subtitle="Comparación entre el ahorro real y el sugerido mensualmente"
          color={CHART_COLORS.emerald}
        >
          {loading ? (
            <ChartPlaceholder variant="line" height={240} />
          ) : realVsSuggested.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay movimientos en el rango."
              />
            </View>
          ) : (
            <LineChartView
              data={realVsSuggested.data as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={realVsSuggested.keys}
              valueFormatter={formatCurrency}
              yAxisType="money"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Cumplimiento mensual"
          subtitle="Promedio de avance porcentual al cierre de cada mes"
          color={CHART_COLORS.amber}
        >
          {loading ? (
            <ChartPlaceholder variant="line" height={240} />
          ) : monthlyCompletion.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay información de cumplimiento en el rango."
              />
            </View>
          ) : (
            <LineChartView
              data={monthlyCompletion.data as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={monthlyCompletion.keys}
              valueFormatter={formatPercentage}
              yAxisType="percentage"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Categorías de metas"
          subtitle="Distribución de metas por categoría de ahorro"
          color={CHART_COLORS.purple}
        >
          {loading ? (
            <ChartPlaceholder variant="pie" height={240} />
          ) : categories.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas en el rango."
              />
            </View>
          ) : (
            <PieChartView data={categories.data} />
          )}
        </ChartCard>

        <ChartCard
          title="Ingresos vs Gastos"
          subtitle="Comparación mensual entre ingresos y gastos totales"
          color={CHART_COLORS.cyan}
        >
          {loading ? (
            <ChartPlaceholder variant="bar" height={240} />
          ) : incomeExpense.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay movimientos en el rango."
              />
            </View>
          ) : (
            <BarChartView
              data={incomeExpense.data as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={incomeExpense.keys}
              labelKey="month"
              valueFormatter={formatCurrency}
              yAxisType="money"
            />
          )}
        </ChartCard>

        <ChartCard
          title="Top 5 metas por avance"
          subtitle="Metas con mayor porcentaje de progreso en el período"
          color={CHART_COLORS.red}
        >
          {loading ? (
            <ChartPlaceholder variant="bar" height={240} />
          ) : topGoals.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                variant="default"
                title="Sin datos"
                subtitle="No hay metas destacadas en el rango."
              />
            </View>
          ) : (
            <BarChartView
              data={topGoals.data as unknown as Array<Record<string, string | number | undefined>>}
              dataKeys={topGoals.keys}
              labelKey="name"
              valueFormatter={formatPercentage}
            />
          )}
        </ChartCard>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={toast.hide}
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

