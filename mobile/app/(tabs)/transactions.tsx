import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import {
  TransactionsFilters,
  TransactionsKpis,
  GoalSummary,
  TransactionsList,
} from '@/components/transactions';
import { RefreshControl, Toast, EmptyState } from '@/components/ui';
import { useGoalsContext } from '@/contexts/GoalsContext';
import { useTransactionsNavigation } from '@/contexts/TransactionsNavigationContext';
import {
  listGoals,
  listTransactions,
  Goal,
  Transaction,
} from '@/services/goals';
import { AddTransactionModal } from '@/components/goals';
import { AddTransactionPayload } from '@/services/goals';
import { addTransactionToGoal } from '@/services/goals';
import { compareYMDDates } from '@/utils/date';
import { useCheckFixedMovementNotifications } from '@/components/notifications/FixedMovementNotificationChecker';
import { triggerRefresh } from '@/utils/notifications/countManager';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { refreshGoals, goalsVersion } = useGoalsContext();
  const { selectedGoalId, setSelectedGoalId } = useTransactionsNavigation();
  const { checkNotifications: checkFixedMovementNotifications } = useCheckFixedMovementNotifications();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [transactionType, setTransactionType] = useState<'Fijo' | 'Variable' | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const [addTxModalOpen, setAddTxModalOpen] = useState(false);
  const [addTxType, setAddTxType] = useState<'income' | 'expense'>('income');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (goalsVersion > 0) {
      loadGoals(true);
    }
  }, [goalsVersion]);

  // Reaccionar cuando se selecciona una meta desde el contexto de navegación
  useEffect(() => {
    if (selectedGoalId && goals.length > 0) {
      const goalToSelect = goals.find((g) => g.id === selectedGoalId);
      if (goalToSelect && goalToSelect.id !== selectedGoal?.id) {
        setSelectedGoal(goalToSelect);
        setSelectedGoalId(null); // Limpiar después de usar
      }
    }
  }, [selectedGoalId, goals]);

  useEffect(() => {
    if (selectedGoal) {
      loadTransactions();
    }
  }, [selectedGoal, transactionType, dateRange]);

  const loadGoals = async (skipLoading = false) => {
    if (!skipLoading) setLoading(true);
    try {
      const response = await listGoals({
        page: 1,
        per_page: 100,
        estado: 'active,completed,expired',
      });

      if (response.data && response.data.length > 0) {
        setGoals(response.data);
        
        // Si hay un goalId seleccionado desde el contexto (navegación desde notificaciones)
        if (selectedGoalId) {
          const goalFromContext = response.data.find((g) => g.id === selectedGoalId);
          if (goalFromContext) {
            setSelectedGoal(goalFromContext);
            setSelectedGoalId(null); // Limpiar después de usar
          } else if (!selectedGoal) {
            setSelectedGoal(response.data[0]);
          } else {
            // Actualizar la meta seleccionada si existe
            const updated = response.data.find((g) => g.id === selectedGoal.id);
            if (updated) {
              setSelectedGoal(updated);
            }
          }
        } else if (!selectedGoal) {
          setSelectedGoal(response.data[0]);
        } else {
          // Actualizar la meta seleccionada si existe
          const updated = response.data.find((g) => g.id === selectedGoal.id);
          if (updated) {
            setSelectedGoal(updated);
          }
        }
      } else {
        setGoals([]);
        setSelectedGoal(null);
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
  };

  const loadTransactions = async () => {
    if (!selectedGoal) return;

    if (dateRange.start && dateRange.end) {
      const comparison = compareYMDDates(dateRange.start, dateRange.end);
      if (comparison > 0) {
        showToast('Rango de fechas inválido', 'error');
        setDateRange({ start: '', end: '' });
        return;
      }
    }

    setTransactionsLoading(true);
    try {
      const params: any = {};
      
      if (dateRange.start && dateRange.end) {
        params.start_date = dateRange.start;
        params.end_date = dateRange.end;
      }

      if (transactionType !== null) {
        params.is_fixed = transactionType === 'Fijo';
      }

      const response = await listTransactions(selectedGoal.id, params);
      setTransactions(response.data || []);
      
      // Verificar notificaciones de movimientos fijos después de cargar transacciones
      checkFixedMovementNotifications();
    } catch (error: any) {
      console.error('Error al cargar transacciones:', error);
      showToast('Error al cargar las transacciones', 'error');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals(true);
  };

  const handleClearFilters = () => {
    setTransactionType(null);
    setDateRange({ start: '', end: '' });
  };

  const handleAddTransaction = (type: 'income' | 'expense') => {
    if (!selectedGoal) return;
    setAddTxType(type);
    setAddTxModalOpen(true);
  };

  const handleSaveTransaction = async (
    payload: AddTransactionPayload & { goalId: number }
  ) => {
    try {
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

      setAddTxModalOpen(false);
      await loadTransactions();
      refreshGoals();
    } catch (error: any) {
      showToast(error.message || 'Error al guardar la transacción', 'error');
      throw error;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const incomes = useMemo(
    () => transactions.filter((t) => t.type === 'income'),
    [transactions]
  );

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions]
  );

  const totals = useMemo(() => {
    const income = incomes.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const expense = expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    return { income, expense, balance: income - expense };
  }, [incomes, expenses]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (goals.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EmptyState
            variant="goals"
            title="No hay metas disponibles"
            subtitle="Crea una meta para poder ver sus transacciones y movimientos financieros."
            description="Necesitas tener al menos una meta de ahorro para poder registrar y visualizar tus ingresos y gastos."
          />
        </ScrollView>
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
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
            Ingresos y Gastos por Meta
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Selecciona una meta para ver sus movimientos
          </Text>
        </View>

        {/* Filtros */}
        <TransactionsFilters
          goals={goals}
          selectedGoal={selectedGoal}
          onGoalChange={setSelectedGoal}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClear={handleClearFilters}
          loading={loading}
        />

        {/* Resumen de Meta */}
        {selectedGoal && <GoalSummary goal={selectedGoal} />}

        {/* KPIs */}
        <TransactionsKpis
          totalIncome={totals.income}
          totalExpense={totals.expense}
          netBalance={totals.balance}
        />

        {/* Listas de Transacciones */}
        <View style={styles.listsContainer}>
          <View style={styles.listColumn}>
            <TransactionsList
              title="Ingresos"
              transactions={incomes}
              loading={transactionsLoading}
              onAdd={selectedGoal ? () => handleAddTransaction('income') : undefined}
              fabIcon="arrow-up"
              fabColor={theme.colors.primary}
            />
          </View>
          <View style={styles.listColumn}>
            <TransactionsList
              title="Gastos"
              transactions={expenses}
              loading={transactionsLoading}
              onAdd={selectedGoal ? () => handleAddTransaction('expense') : undefined}
              fabIcon="arrow-down"
              fabColor={theme.colors.error}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal para agregar transacción */}
      {selectedGoal && (
        <AddTransactionModal
          visible={addTxModalOpen}
          onDismiss={() => setAddTxModalOpen(false)}
          goal={selectedGoal}
          initialType={addTxType}
          onSubmit={(payload) =>
            handleSaveTransaction({ ...payload, goalId: selectedGoal.id })
          }
        />
      )}

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
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
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
  listsContainer: {
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
  },
  listColumn: {
    width: '100%',
  },
});

