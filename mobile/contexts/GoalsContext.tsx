import React, { createContext, useContext, useState, useCallback } from 'react';

interface GoalsContextType {
  refreshGoals: () => void;
  refreshDashboard: () => void;
  refreshAll: () => void;
  goalsVersion: number;
  dashboardVersion: number;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goalsVersion, setGoalsVersion] = useState(0);
  const [dashboardVersion, setDashboardVersion] = useState(0);

  const refreshGoals = useCallback(() => {
    setGoalsVersion((prev) => prev + 1);
  }, []);

  const refreshDashboard = useCallback(() => {
    setDashboardVersion((prev) => prev + 1);
  }, []);

  const refreshAll = useCallback(() => {
    setGoalsVersion((prev) => prev + 1);
    setDashboardVersion((prev) => prev + 1);
  }, []);

  return (
    <GoalsContext.Provider
      value={{
        refreshGoals,
        refreshDashboard,
        refreshAll,
        goalsVersion,
        dashboardVersion,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoalsContext() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoalsContext must be used within a GoalsProvider');
  }
  return context;
}

