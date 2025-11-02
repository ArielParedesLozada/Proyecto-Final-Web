import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, ActivityIndicator } from 'react-native-paper';
import { getDashboardSummary, DashboardSummary } from '@/services/stats';
import { RefreshControl } from '@/components/ui';
import { useGoalsContext } from '@/contexts/GoalsContext';
import StatCard from './StatCard';
import GoalItem from './GoalItem';
import CompletedList from './CompletedList';
import EmptyState from './EmptyState';

export default function Dashboard() {
  const theme = useTheme();
  const { dashboardVersion } = useGoalsContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardSummary | null>(null);

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh && !refreshing) {
      setLoading(true);
    }
    try {
      const response = await getDashboardSummary();
      setData(response);
    } catch (error: any) {
      console.error('Error al cargar dashboard:', error);
      // En producción, podrías mostrar un Toast aquí
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recargar datos cuando cambie la versión del dashboard (se creó/actualizó/eliminó una meta)
  useEffect(() => {
    if (dashboardVersion > 0) {
      loadData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardVersion]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
          Dashboard
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Resumen de tus metas de ahorro y progreso financiero
        </Text>
      </View>

      {/* KPIs Grid */}
      <View style={styles.kpisGrid}>
        <View style={styles.kpiItem}>
          <StatCard
            title="Total Ahorrado"
            value={`$${Number(data?.totalAhorrado || 0).toLocaleString()}`}
            sublabel="Últimos 12 meses"
            icon="account-balance-wallet"
            variant="emerald"
            loading={loading}
          />
        </View>
        <View style={styles.kpiItem}>
          <StatCard
            title="Meta Mensual Sugerida"
            value={`$${Number(data?.metaMensualSugerida || 0).toLocaleString()}`}
            sublabel="Estimación por metas activas"
            icon="track-changes"
            variant="violet"
            loading={loading}
          />
        </View>
        <View style={styles.kpiItem}>
          <StatCard
            title="Metas Activas"
            value={String(data?.metasActivas || 0)}
            sublabel="Actualmente en curso"
            icon="format-list-bulleted"
            variant="indigo"
            loading={loading}
          />
        </View>
        <View style={styles.kpiItem}>
          <StatCard
            title="Progreso Mensual"
            value={`${Number(data?.progresoMensual || 0)}%`}
            sublabel="Real vs sugerido"
            icon="trending-up"
            variant="amber"
            loading={loading}
          />
        </View>
      </View>

      {/* Metas Activas y Completadas */}
      <View style={styles.goalsSection}>
        {/* Metas Activas */}
        <View style={styles.goalsColumn}>
          <Card style={[styles.goalsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.goalsCardContent}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Metas de Ahorro Activas
              </Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                  >
                    Cargando...
                  </Text>
                </View>
              ) : data?.goalsActive && data.goalsActive.length > 0 ? (
                <View style={styles.goalsList}>
                  {data.goalsActive.map((goal) => (
                    <GoalItem
                      key={goal.id}
                      name={goal.name}
                      current={goal.current}
                      target={goal.target}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  variant="goals"
                  title="Sin metas activas"
                  subtitle="Crea tu primera meta para empezar tu viaje hacia el ahorro."
                  description="Las metas te ayudan a organizar tus finanzas y alcanzar tus objetivos financieros de manera estructurada."
                />
              )}
            </Card.Content>
          </Card>
        </View>

        {/* Metas Completadas */}
        <View style={styles.goalsColumn}>
          <Card style={[styles.goalsCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.goalsCardContent}>
              <Text
                variant="titleMedium"
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Metas Completadas
              </Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                  >
                    Cargando...
                  </Text>
                </View>
              ) : data?.goalsCompleted && data.goalsCompleted.length > 0 ? (
                <CompletedList
                  items={data.goalsCompleted.map((g) => ({
                    id: g.id,
                    name: g.name,
                    finishedAt: g.finishedAt,
                    deadline: g.deadline,
                  }))}
                />
              ) : (
                <EmptyState
                  variant="completed"
                  title="Nada completado aún"
                  subtitle="Aquí verás tus logros recientes cuando completes tus metas."
                  description="Cada meta completada representa un paso importante hacia tus objetivos financieros."
                />
              )}
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
  kpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  kpiItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  goalsSection: {
    gap: 16,
  },
  goalsColumn: {
    width: '100%',
  },
  goalsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  goalsCardContent: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  goalsList: {
    gap: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});

