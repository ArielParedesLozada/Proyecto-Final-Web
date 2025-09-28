import api from "./http";

export const getGoalsStatusDistribution = (params = {}) =>
    api.get("/stats/goals/status-distribution", { params }).then((r) => r.data);

export const getMonthlyRealVsSuggested = (params = {}) =>
    api.get("/stats/monthly/real-vs-suggested", { params }).then((r) => r.data);

export const getMonthlyCompletion = (params = {}) =>
    api.get("/stats/monthly/completion", { params }).then((r) => r.data);

export const getCategoryDistribution = (params = {}) =>
    api.get("/stats/categories/distribution", { params }).then((r) => r.data);

export const getMonthlyIncomeExpense = (params = {}) =>
    api.get("/stats/monthly/income-expense", { params }).then((r) => r.data);

export const getTopGoalsProgress = (params = {}) =>
    api.get("/stats/goals/top-progress", { params }).then((r) => r.data);
