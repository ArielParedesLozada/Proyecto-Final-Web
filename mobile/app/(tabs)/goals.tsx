import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import {
  GoalCard,
  GoalsHeader,
  EmptyGoalsState,
  NewGoalModal,
} from '@/components/goals';
import { Modal, Toast, RefreshControl } from '@/components/ui';
import { useGoalsContext } from '@/contexts/GoalsContext';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  Goal,
  CreateGoalPayload,
} from '@/services/goals';
import { calculateProgress } from '@/services/goals';

export default function GoalsScreen() {
  const theme = useTheme();
  const { refreshGoals, refreshDashboard, goalsVersion } = useGoalsContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

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
    } catch (error: any) {
      console.error('Error al cargar metas:', error);
      showToast('Error al cargar las metas', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Recargar metas cuando cambie la versión (se actualizó desde otra pantalla)
  useEffect(() => {
    if (goalsVersion > 0) {
      loadGoals(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Notificar a Dashboard y otras pantallas que se creó una meta
      refreshDashboard();
      refreshGoals();
    } catch (error: any) {
      console.error('Error al crear meta:', error);
      showToast(error.message || 'Error al crear la meta', 'error');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSubmitEdit = async (payload: CreateGoalPayload & { id?: number; status?: string }) => {
    if (!editingGoal?.id) return;

    try {
      await updateGoal(editingGoal.id, {
        name: payload.name,
        category: payload.category,
        description: payload.description,
        target_amount: payload.target_amount,
        target_date: payload.target_date,
        status: payload.status || editingGoal.status,
      });

      showToast('Cambios guardados', 'success');
      setModalOpen(false);
      setEditingGoal(null);
      await loadGoals(true);
      // Notificar a Dashboard que se actualizó una meta
      refreshDashboard();
      refreshGoals();
    } catch (error: any) {
      console.error('Error al actualizar meta:', error);
      showToast(error.message || 'Error al actualizar la meta', 'error');
    }
  };

  const askDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (toDeleteId === null) return;

    const goalId = toDeleteId;
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setConfirmDeleteOpen(false);

    try {
      await deleteGoal(goalId);
      showToast('Meta eliminada', 'success');
      await loadGoals(true);
      // Notificar a Dashboard que se eliminó una meta
      refreshDashboard();
      refreshGoals();
    } catch (error: any) {
      console.error('Error al eliminar meta:', error);
      showToast(error.message || 'Error al eliminar la meta', 'error');
      await loadGoals(true);
    } finally {
      setToDeleteId(null);
    }
  };

  const handleAddTransaction = (goal: Goal) => {
    // TODO: Implementar modal de transacciones
    showToast('Funcionalidad de transacciones próximamente', 'info');
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
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
            <GoalsHeader onCreateGoal={() => {
              setModalMode('create');
              setEditingGoal(null);
              setModalOpen(true);
            }} />
          </View>

          {goals.length === 0 ? (
            <EmptyGoalsState />
          ) : (
            <View style={styles.goalsList}>
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={askDelete}
                  onAddTransaction={handleAddTransaction}
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
          setEditingGoal(null);
        }}
        onSubmit={modalMode === 'edit' ? handleSubmitEdit : handleCreateGoal}
        mode={modalMode}
        initialGoal={editingGoal}
      />

      <Modal
        visible={confirmDeleteOpen}
        onDismiss={() => setConfirmDeleteOpen(false)}
        title="Eliminar meta"
        message="¿Estás seguro de eliminar esta meta? Esta acción no se puede deshacer."
        primaryAction={{
          label: 'Sí, eliminar',
          onPress: confirmDelete,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setConfirmDeleteOpen(false),
        }}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
});

