import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { InteractionManager } from 'react-native';

import { useGoalsContext } from '@/contexts/GoalsContext';
import {
  getGoalsStatusDistribution,
  getMonthlyCompletion,
  getMonthlyIncomeExpense,
  getMonthlyRealVsSuggested,
  getTopGoalsProgress,
  getCategoryDistribution,
  StatusDistribution,
  MonthlyCompletion,
  MonthlyIncomeExpense,
  MonthlyRealVsSuggested,
  TopGoalProgress,
  CategoryDistribution,
} from '@/services/stats';
import { compareYMDDates } from '@/utils/date';
import {
  REAL_VS_SUGGESTED_KEYS,
  COMPLETION_KEYS,
  INCOME_EXPENSE_KEYS,
  TOP_GOALS_KEYS,
} from '@/constants/stats';

const MAX_LINE_POINTS = 12;
const MAX_BAR_POINTS = 12;

type ToastType = 'success' | 'error' | 'info';

function arraysShallowEqual<T>(a: T[] | null | undefined, b: T[] | null | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const itemA = a[i];
    const itemB = b[i];

    if (itemA === itemB) continue;

    if (
      itemA &&
      itemB &&
      typeof itemA === 'object' &&
      typeof itemB === 'object'
    ) {
      const objA = itemA as Record<string, unknown>;
      const objB = itemB as Record<string, unknown>;
      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) return false;

      for (let j = 0; j < keysA.length; j += 1) {
        const key = keysA[j];
        if (objA[key] !== objB[key]) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  return true;
}

function downsampleSeries<T>(data: T[] | null | undefined, maxPoints: number): T[] {
  if (!Array.isArray(data)) return [];
  if (data.length <= maxPoints) return data;

  if (maxPoints <= 2) {
    return [data[0], data[data.length - 1]];
  }

  const step = (data.length - 1) / (maxPoints - 1);
  const result: T[] = [];
  let previousIndex = -1;

  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.min(data.length - 1, Math.round(i * step));
    if (index !== previousIndex) {
      result.push(data[index]);
      previousIndex = index;
    }
  }

  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }

  return result;
}

export function useStatsScreen() {
  const { goalsVersion, dashboardVersion } = useGoalsContext();

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
  const [toastType, setToastType] = useState<ToastType>('success');

  const lastAppliedRangeRef = useRef<string>('');
  const isFirstLoadRef = useRef(true);
  const [isTransitionPending, startTransition] = useTransition();
  const lastVersionRef = useRef({ goals: goalsVersion, dashboard: dashboardVersion });

  const validRange = useMemo(() => {
    const { start, end } = dateRange;
    if (!start && !end) return {};
    if (start && end && compareYMDDates(start, end) <= 0) return { start, end };
    return {};
  }, [dateRange]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const setStatusDataSafe = useCallback((next: StatusDistribution[]) => {
    setStatusData((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const setRealVsSuggestedSafe = useCallback((next: MonthlyRealVsSuggested[]) => {
    setRealVsSuggested((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const setMonthlyCompletionSafe = useCallback((next: MonthlyCompletion[]) => {
    setMonthlyCompletion((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const setCategoryDistSafe = useCallback((next: CategoryDistribution[]) => {
    setCategoryDist((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const setIncomeExpenseSafe = useCallback((next: MonthlyIncomeExpense[]) => {
    setIncomeExpense((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const setTopGoalsSafe = useCallback((next: TopGoalProgress[]) => {
    setTopGoals((prev) => (arraysShallowEqual(prev, next) ? prev : next));
  }, []);

  const loadAll = useCallback(async (forceRefresh = false) => {
    if (forceRefresh || !isFirstLoadRef.current) {
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

      InteractionManager.runAfterInteractions(() => {
        startTransition(() => {
          if (st) setStatusDataSafe(Array.isArray(st) ? st : []);
          if (rvs) setRealVsSuggestedSafe(Array.isArray(rvs) ? rvs : []);
          if (comp) setMonthlyCompletionSafe(Array.isArray(comp) ? comp : []);
          if (cat) setCategoryDistSafe(Array.isArray(cat) ? cat : []);
          if (incExp) setIncomeExpenseSafe(Array.isArray(incExp) ? incExp : []);
          if (top) setTopGoalsSafe(Array.isArray(top) ? top : []);
        });
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      showToast('Error al cargar las estadísticas', 'error');
    } finally {
      InteractionManager.runAfterInteractions(() => {
        startTransition(() => {
          setLoading(false);
          setRefreshing(false);
          isFirstLoadRef.current = false;
        });
      });
    }
  }, [
    validRange,
    setStatusDataSafe,
    setRealVsSuggestedSafe,
    setMonthlyCompletionSafe,
    setCategoryDistSafe,
    setIncomeExpenseSafe,
    setTopGoalsSafe,
    showToast,
  ]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const { start, end } = dateRange;
    const key = `${start || ''}|${end || ''}`;

    if (start && end && compareYMDDates(start, end) > 0) {
      showToast('Rango de fechas inválido', 'error');
      setDateRange({ start: '', end: '' });
      return;
    }

    if ((start && !end) || (!start && end)) {
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
  }, [dateRange, loadAll, showToast]);

  useEffect(() => {
    const prev = lastVersionRef.current;
    if (prev.goals === goalsVersion && prev.dashboard === dashboardVersion) {
      return;
    }

    lastVersionRef.current = { goals: goalsVersion, dashboard: dashboardVersion };

    if (isFirstLoadRef.current) {
      return;
    }

    loadAll(true);
  }, [goalsVersion, dashboardVersion, loadAll]);

  const handleRefresh = useCallback(() => {
    loadAll(true);
  }, [loadAll]);

  const handleClear = useCallback(() => {
    setDateRange({ start: '', end: '' });
    showToast('Filtros limpiados', 'success');
  }, [showToast]);

  const slimRealVsSuggested = useMemo(
    () => downsampleSeries(realVsSuggested, MAX_LINE_POINTS),
    [realVsSuggested],
  );

  const slimMonthlyCompletion = useMemo(
    () => downsampleSeries(monthlyCompletion, MAX_LINE_POINTS),
    [monthlyCompletion],
  );

  const slimIncomeExpense = useMemo(
    () => downsampleSeries(incomeExpense, MAX_BAR_POINTS),
    [incomeExpense],
  );

  const slimTopGoals = useMemo(
    () => downsampleSeries(topGoals, MAX_BAR_POINTS),
    [topGoals],
  );

  const pieData = useMemo(() => {
    return (Array.isArray(statusData) ? statusData : []).map((x) => ({
      name: x.status,
      value: Number(x.value) || 0,
    }));
  }, [statusData]);

  const statusTotal = useMemo(() => pieData.reduce((acc, it) => acc + (it.value || 0), 0), [pieData]);

  const categoryData = useMemo(
    () => (Array.isArray(categoryDist) ? categoryDist : []).map((x) => ({
      name: x.category,
      value: Number(x.value) || 0,
    })),
    [categoryDist],
  );

  const realVsSuggestedKeys = useMemo(
    () => REAL_VS_SUGGESTED_KEYS.map((item) => ({ ...item })),
    [],
  );

  const completionKeys = useMemo(
    () => COMPLETION_KEYS.map((item) => ({ ...item })),
    [],
  );

  const incomeExpenseKeys = useMemo(
    () => INCOME_EXPENSE_KEYS.map((item) => ({ ...item })),
    [],
  );

  const topGoalsKeys = useMemo(
    () => TOP_GOALS_KEYS.map((item) => ({ ...item })),
    [],
  );

  const hideToast = useCallback(() => setToastVisible(false), []);

  return {
    loading,
    isRefreshing: refreshing || isTransitionPending,
    dateRange,
    setDateRange,
    handleRefresh,
    handleClear,
    toast: {
      visible: toastVisible,
      message: toastMessage,
      type: toastType,
      hide: hideToast,
    },
    charts: {
      status: { pieData, statusTotal },
      categories: { data: categoryData },
      realVsSuggested: { data: slimRealVsSuggested, keys: realVsSuggestedKeys },
      monthlyCompletion: { data: slimMonthlyCompletion, keys: completionKeys },
      incomeExpense: { data: slimIncomeExpense, keys: incomeExpenseKeys },
      topGoals: { data: slimTopGoals, keys: topGoalsKeys },
    },
  };
}

