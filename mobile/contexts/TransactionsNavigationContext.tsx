import React, { createContext, useContext, useState, useCallback } from 'react';

interface TransactionsNavigationContextType {
  selectedGoalId: number | null;
  setSelectedGoalId: (goalId: number | null) => void;
  navigateToTransactions: (goalId: number) => void;
}

const TransactionsNavigationContext = createContext<TransactionsNavigationContextType | undefined>(undefined);

export function useTransactionsNavigation() {
  const context = useContext(TransactionsNavigationContext);
  if (!context) {
    throw new Error('useTransactionsNavigation debe ser usado dentro de TransactionsNavigationProvider');
  }
  return context;
}

export function TransactionsNavigationProvider({ children }: { children: React.ReactNode }) {
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const navigateToTransactions = useCallback((goalId: number) => {
    setSelectedGoalId(goalId);
  }, []);

  return (
    <TransactionsNavigationContext.Provider
      value={{
        selectedGoalId,
        setSelectedGoalId,
        navigateToTransactions,
      }}
    >
      {children}
    </TransactionsNavigationContext.Provider>
  );
}

