// src/pages/TransactionsByGoalPage.jsx
import { useMemo, useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import TransactionsKpis from "../components/transactions/TransactionsKpis";
import TransactionItem from "../components/transactions/TransactionItem";
import ScrollArea from "../components/ui/ScrollArea";
import GoalSelect from "../components/goals/GoalSelect";
import Empty from "../components/ui/Empty";
import TransactionsFilters from "../components/transactions/TransactionsFilters";

// Servicios
import { listGoals } from "../services/goals";
import { listTransactions } from "../services/transactions";
import { goalApiToUi } from "../services/adapters";
import useCache from "../hooks/useCache";

// Toasts
import { ToastProvider, useToast } from "../components/ui/ToastProvider";

function TransactionsByGoalPageInner() {
  const { fetchWithCache, invalidateCache } = useCache();
  const toast = useToast();
  
  // Estados
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [calculatedProgress, setCalculatedProgress] = useState(0);
  
  // Filtros
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [transactionType, setTransactionType] = useState([]);

  // Cargar metas al montar el componente
  useEffect(() => {
    // Invalidar caché de metas al entrar a la página
    invalidateCache('transactions-goals-list');
    loadGoals();
  }, [invalidateCache]);

  // Cargar transacciones cuando cambie la meta seleccionada
  useEffect(() => {
    if (selectedGoal) {
      // Invalidar caché de transacciones al cambiar de meta
      invalidateCache(`transactions-goal-${selectedGoal.id}`);
      loadTransactions(selectedGoal.id, false); // Usar caché para mejor rendimiento
    }
  }, [selectedGoal, invalidateCache]);

  // Recargar transacciones cuando cambien los filtros
  useEffect(() => {
    if (selectedGoal) {
      loadTransactions(selectedGoal.id, true);
    }
  }, [dateRange, transactionType]);

  // Escuchar cambios en las transacciones (cuando se agregan desde otras páginas)
  useEffect(() => {
    const handleTransactionUpdate = (event) => {
      if (selectedGoal) {
        console.log('Transaction update detected, reloading...', event.detail);
        // Invalidar caché y recargar transacciones con forceRefresh
        invalidateCache(`transactions-goal-${selectedGoal.id}`);
        loadTransactions(selectedGoal.id, true); // forceRefresh = true
      }
    };

    // Escuchar eventos personalizados de actualización de transacciones
    window.addEventListener('transactionAdded', handleTransactionUpdate);
    window.addEventListener('transactionDeleted', handleTransactionUpdate);
    window.addEventListener('goalUpdated', handleTransactionUpdate);

    return () => {
      window.removeEventListener('transactionAdded', handleTransactionUpdate);
      window.removeEventListener('transactionDeleted', handleTransactionUpdate);
      window.removeEventListener('goalUpdated', handleTransactionUpdate);
    };
  }, [selectedGoal?.id, invalidateCache]); // Solo dependencia del ID, no del objeto completo

  // Recargar datos cuando la página se vuelve visible (al regresar de otra página)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedGoal) {
        console.log('Page became visible, refreshing data...');
        // Invalidar todos los cachés y recargar
        invalidateCache('transactions-goals-list');
        invalidateCache(`transactions-goal-${selectedGoal.id}`);
        loadGoals();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedGoal?.id, invalidateCache]);

  async function loadGoals() {
    try {
      setLoading(true);
      const cacheKey = 'transactions-goals-list';
      const res = await fetchWithCache(
        cacheKey,
        () => listGoals({ 
          pageSize: 100,
          estado: 'active,completed,expired' // Especificar todos los estados para obtener TODAS las metas
        }),
        { forceRefresh: false } // Usar caché para mejor rendimiento
      );
      
      console.log('Goals API response:', res);
      console.log('Total goals in response:', res?.data?.length || 0);
      
      if (res?.data) {
        const goalsList = res.data.map(goalApiToUi);
        console.log('Goals list after mapping:', goalsList);
        console.log('Goals count after mapping:', goalsList.length);
        setGoals(goalsList);
        
        // Seleccionar la primera meta por defecto
        if (goalsList.length > 0) {
          setSelectedGoal(goalsList[0]);
          console.log('Selected goal:', goalsList[0]);
        } else {
          console.log('No goals found!');
        }
      } else {
        console.log('No data in response!');
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.push({ 
        tone: "error", 
        title: "Error al cargar metas", 
        message: "No se pudieron cargar las metas disponibles" 
      });
    } finally {
      setLoading(false);
    }
  }

  // Función para aplicar filtros
  const applyFilters = (newDateRange, newTransactionType) => {
    if (selectedGoal) {
      loadTransactions(selectedGoal.id, true, newDateRange, newTransactionType);
    }
  };

  async function loadTransactions(goalId, forceRefresh = false, customDateRange = null, customTransactionType = null) {
    try {
      setTransactionsLoading(true);
      console.log('Loading transactions for goal ID:', goalId);
      
      // Usar filtros personalizados o los del estado
      const currentDateRange = customDateRange || dateRange;
      const currentTransactionType = customTransactionType || transactionType;
      
      // Construir parámetros de filtro
      const params = {};
      
      // Filtros de fecha
      if (currentDateRange.start && currentDateRange.end) {
        params.start_date = currentDateRange.start;
        params.end_date = currentDateRange.end;
      }
      
      // Filtros de tipo de transacción (exclusivo)
      if (currentTransactionType.length === 1) {
        params.is_fixed = currentTransactionType.includes('Fijo') ? true : false;
        console.log('Filtering by transaction type:', currentTransactionType, 'is_fixed:', params.is_fixed, 'type:', typeof params.is_fixed);
      }
      // Si no hay tipo seleccionado, no se incluye el parámetro is_fixed
      
      console.log('Final params being sent to API:', params);
      const cacheKey = `transactions-goal-${goalId}-${JSON.stringify(params)}`;
      const res = await fetchWithCache(
        cacheKey,
        () => listTransactions(goalId, params),
        { forceRefresh }
      );
      
      console.log('Transactions API response:', res);
      
      if (res?.data) {
        setTransactions(res.data);
        console.log('Transactions loaded:', res.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.push({ 
        tone: "error", 
        title: "Error al cargar transacciones", 
        message: "No se pudieron cargar las transacciones de esta meta" 
      });
    } finally {
      setTransactionsLoading(false);
    }
  }

  // Calcular progreso cuando cambien las transacciones
  useEffect(() => {
    if (transactions.length > 0) {
      const incomes = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');
      const totalIncome = incomes.reduce((a, b) => a + (Number(b.amount) || 0), 0);
      const totalExpense = expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
      const newAccumulated = totalIncome - totalExpense;
      setCalculatedProgress(Math.max(0, newAccumulated));
    }
  }, [transactions]);

  // Filtrar transacciones por tipo
  const incomes = useMemo(() => 
    transactions.filter(t => t.type === 'income'), 
    [transactions]
  );
  
  const expenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense'), 
    [transactions]
  );

  // KPIs de la meta seleccionada
  const totals = useMemo(() => {
    const income = incomes.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const expense = expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    return { income, expense, balance: income - expense };
  }, [incomes, expenses]);

  // Opciones para el selector de metas
  const goalOptions = useMemo(() => 
    goals.map(goal => ({
      value: goal.id,
      label: goal.name // Solo mostrar el nombre de la meta
    })), 
    [goals]
  );

  function handleGoalChange(goalId) {
    const goalIdNum = parseInt(goalId);
    const goal = goals.find(g => g.id === goalIdNum);
    setSelectedGoal(goal);
  }

 const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Ingresos y Gastos por Meta</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Selecciona una meta para ver sus movimientos
      </p>
  </div>
);


  // Mostrar estado de carga inicial
  if (loading) {
    return (
      <AppLayout header={header}>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Mostrar estado vacío si no hay metas
  if (goals.length === 0) {
    return (
      <AppLayout header={header}>
        <Empty
          title="No hay metas disponibles"
          subtitle="Crea una meta para poder ver sus transacciones"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout header={header}>
      <div className="grid gap-4 xl:h-full xl:grid-rows-[auto_auto_auto_minmax(0,1fr)]">
        {/* Filtros */}
        <div className="relative z-0 mb-1 overflow-visible">
          <TransactionsFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onDateRangeClear={() => setDateRange({ start: "", end: "" })}
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            onTransactionTypeClear={() => setTransactionType([])}
            goals={goals}
            selectedGoal={selectedGoal}
            onGoalChange={handleGoalChange}
            loading={loading}
            onApplyFilters={applyFilters}
          />
        </div>

        {/* Información de la meta seleccionada */}
        {selectedGoal && (
          <div className="relative z-0 mt-0 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">{selectedGoal.name}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedGoal.category} • {selectedGoal.status} • 
                  Progreso: ${calculatedProgress.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs en la parte superior */}
        <div className="grid gap-4">
        <TransactionsKpis totals={totals} />
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:min-h-0 lg:items-stretch">
            {/* Ingresos */}
          <div className="min-h-0 lg:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <header className="mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ingresos</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {incomes.length} registro(s)
                </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </div>
              </header>
              
                <ScrollArea className="flex-1 min-h-0 space-y-3">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : incomes.length ? (
                incomes.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    item={{
                      id: transaction.id,
                      type: transaction.type,
                      category: transaction.is_fixed ? 'fijo' : 'variable',
                      categoryLabel: transaction.is_fixed ? 'Fijo' : 'Variable',
                      title: transaction.description || '—',
                      amount: transaction.amount,
                      date: transaction.occurred_on
                    }} 
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin ingresos registrados</p>
                </div>
                )}
              </ScrollArea>
              </div>
            </div>

            {/* Gastos */}
          <div className="min-h-0 lg:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <header className="mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Gastos</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {expenses.length} registro(s)
                </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                </div>
              </header>
              
                <ScrollArea className="flex-1 min-h-0 space-y-3">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : expenses.length ? (
                expenses.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    item={{
                      id: transaction.id,
                      type: transaction.type,
                      category: transaction.is_fixed ? 'fijo' : 'variable',
                      categoryLabel: transaction.is_fixed ? 'Fijo' : 'Variable',
                      title: transaction.description || '—',
                      amount: transaction.amount,
                      date: transaction.occurred_on
                    }} 
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin gastos registrados</p>
                </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Wrapper con ToastProvider
export default function TransactionsByGoalPage() {
  return (
    <ToastProvider>
      <TransactionsByGoalPageInner />
    </ToastProvider>
  );
}
