import api from "./http";

export const addTransaction = (goalId, payload) =>
    api.post(`/goals/${goalId}/transactions`, payload).then((r) => r.data);

export const listTransactions = (goalId, params = {}) =>
    api.get(`/goals/${goalId}/transactions`, { params }).then((r) => r.data);

export const deleteTransaction = (txId) =>
    api.delete(`/transactions/${txId}`).then((r) => r.data);
