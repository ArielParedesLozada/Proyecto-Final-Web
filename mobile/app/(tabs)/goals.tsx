import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  GoalCard,
  GoalsHeader,
  NewGoalModal,
  AddTransactionModal,
  GoalDetailModal,
} from '@/components/goals';
import { Toast, RefreshControl, EmptyState, LoadingState } from '@/components/ui';
import { useGoalsContext } from '@/contexts/GoalsContext';
import {
  listGoals,
  createGoal,
  addTransactionToGoal,
  Goal,
  CreateGoalPayload,
  AddTransactionPayload,
} from '@/services/goals';
import { calculateProgress } from '@/services/goals';
import { notifyGoalCompleted, notifySuggestedSavings } from '@/utils/notifications';
import { useCheckFixedMovementNotifications } from '@/components/notifications/FixedMovementNotificationChecker';
import { triggerRefresh } from '@/utils/notifications/countManager';

export default function GoalsScreen() {
  const theme = useTheme();
  const { refreshGoals, refreshDashboard, goalsVersion } = useGoalsContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txGoal, setTxGoal] = useState<Goal | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const filterCompletedGoals = (goalsList: Goal[]) => {
    return goalsList.filter((goal) => {
      const current = goal.accumulated ?? goal.current_amount ?? 0;
      const target = goal.target_amount;
      const progress = calculateProgress(current, target);
      return progress < 100;
    });
  };

  const { checkNotifications: checkFixedMovementNotifications } = useCheckFixedMovementNotifications();

  const loadGoals = useCallback(async (skipLoading = false) => {
    if (!skipLoading) setLoading(true);
    try {
      const response = await listGoals({
        page: 1,
        per_page: 50,
        estado: 'active',
      });
      
      if (response.data) {
        const filtered = filterCompletedGoals(response.data);
        setGoals(filtered);
      }
      
      // Verificar notificaciones de movimientos fijos después de cargar metas
      checkFixedMovementNotifications();
    } catch (error: any) {
      console.error('Error al cargar metas:', error);
      showToast('Error al cargar las metas', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkFixedMovementNotifications]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    if (goalsVersion > 0) {
      loadGoals(true);
    }
  }, [goalsVersion]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals(true);
  }, [loadGoals]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleCreateGoal = async (payload: CreateGoalPayload & { id?: number; status?: string }) => {
    try {
      const response = await createGoal({
        name: payload.name,
        category: payload.category,
        description: payload.description,
        target_amount: payload.target_amount,
        target_date: payload.target_date,
      });
      
      showToast('Meta creada correctamente', 'success');
      setModalOpen(false);
      await loadGoals(true);
      refreshDashboard();
      refreshGoals();
      
      // Actualizar badge de notificaciones inmediatamente
      triggerRefresh();
      
      try {
        await notifySuggestedSavings(
          payload.name,
          payload.target_amount,
          payload.target_date,
          0 
        );
      } catch (error) {
        console.warn('No se pudo enviar la notificación:', error);
      }
    } catch (error: any) {
      console.error('Error al crear meta:', error);
      showToast(error.message || 'Error al crear la meta', 'error');
    }
  };

  const handleAddTransaction = (goal: Goal) => {
    setTxGoal(goal);
    setTxModalOpen(true);
  };

  const handleOpenDetails = (goal: Goal) => {
    setDetailGoal(goal);
    setDetailVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailVisible(false);
    setDetailGoal(null);
  };

  const handleSaveTransaction = async (
    payload: AddTransactionPayload & { goalId: number }
  ) => {
    try {
      if (payload.is_fixed && payload.frequency) {
        const { createFixedMovement } = await import('@/services/fixedMovements');
        
        await createFixedMovement({
          goal_id: payload.goalId,
          type: payload.type,
          amount: payload.amount,
          frequency: payload.frequency,
          apply_now: true, 
        });

        const frequencyLabel =
          payload.frequency === 'daily'
            ? 'diaria'
            : payload.frequency === 'weekly'
            ? 'semanal'
            : 'mensual';

        const amountSign = payload.type === 'expense' ? '-$' : '$';
        showToast(
          `Regla fija creada: ${amountSign}${payload.amount.toLocaleString()} ${frequencyLabel}`,
          'success'
        );
      } else {
        const goalBefore = goals.find((g) => g.id === payload.goalId);
        const wasCompletedBefore = goalBefore?.status === 'completed';
        const progressBefore = goalBefore 
          ? calculateProgress(
              goalBefore.accumulated || goalBefore.current_amount || 0,
              goalBefore.target_amount
            )
          : 0;

        const response = await addTransactionToGoal(payload.goalId, {
          type: payload.type,
          amount: payload.amount,
          is_fixed: false,
        });

        const typeLabel = payload.type === 'income' ? 'Ingreso' : 'Gasto';
        showToast(
          `${typeLabel} registrado: ${payload.type === 'income' ? '+' : '-'}$${payload.amount.toLocaleString()}`,
          'success'
        );

        const responseData = response as any;
        
        if (payload.type === 'income' && responseData.goal?.status === 'completed') {
          triggerRefresh();
        }
        
        if (payload.type === 'income' && responseData.goal) {
          const goal = responseData.goal;
          const progressPct = responseData.progress_pct || calculateProgress(
            goal.accumulated || goal.current_amount || 0,
            goal.target_amount
          );

          if (
            progressPct >= 100 && 
            goal.status === 'completed' && 
            !wasCompletedBefore &&
            progressBefore < 100
          ) {
            try {
              await notifyGoalCompleted(goal.name, goal.id);
            } catch (error) {
              console.warn('No se pudo enviar notificación de completado:', error);
            }
          }
        }
      }

      await loadGoals(true);
      refreshDashboard();
      refreshGoals();
    } catch (error: any) {
      console.error('Error al guardar transacción:', error);
      showToast(error.message || 'Error al guardar la transacción', 'error');
      throw error;
    }
  };

  if (loading && !refreshing) {
    return <LoadingState message="Cargando metas..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <GoalsHeader
              onCreateGoal={() => {
                setModalOpen(true);
              }}
            />
          </View>

          {goals.length === 0 ? (
            <EmptyState
              variant="goals"
              title="Aún no tienes metas de ahorro"
              subtitle="Crea tu primera meta para comenzar a registrar tu progreso financiero."
              description="Las metas de ahorro te ayudan a organizar tus finanzas, establecer objetivos claros y hacer un seguimiento de tu progreso hacia la independencia financiera."
              containerStyle={styles.emptyStateContainer}
            />
          ) : (
            <View style={styles.goalsList}>
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAddTransaction={handleAddTransaction}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <NewGoalModal
        visible={modalOpen}
        onDismiss={() => {
          setModalOpen(false);
        }}
        onSubmit={handleCreateGoal}
      />

      <AddTransactionModal
        visible={txModalOpen}
        onDismiss={() => {
          setTxModalOpen(false);
          setTxGoal(null);
        }}
        goal={txGoal}
        onSubmit={handleSaveTransaction}
      />

      <GoalDetailModal
        visible={detailVisible}
        goal={detailGoal}
        onDismiss={handleCloseDetails}
      />

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
    paddingBottom: 16,
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    marginTop: 8,
    paddingTop: 8,
  },
  goalsList: {
    marginTop: 16,
  },
  emptyStateContainer: {
    flex: 1,
    minHeight: 300,
  },
});

