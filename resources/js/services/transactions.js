import api from "./http";

export const FREQ = {
    MONTHLY: "monthly",
    WEEKLY: "weekly",
    DAILY: "daily",
};

function shapeTxPayload(p = {}) {
    const body = {
        type: p.type,               
        is_fixed: !!p.is_fixed,     
        amount: Number(p.amount),
    };
    if (p.occurred_on) body.occurred_on = p.occurred_on;
    return body;
}

export const addTransaction = (goalId, payload) =>
    api.post(`/goals/${goalId}/transactions`, shapeTxPayload(payload)).then(r => r.data);

export const listTransactions = (goalId, params = {}) =>
    api.get(`/goals/${goalId}/transactions`, { params }).then(r => r.data);

export const deleteTransaction = (txId) =>
    api.delete(`/transactions/${txId}`).then(r => r.data);

export const listRecurringRules = async (goalId, params = {}) => {
    const res = await api.get(`/fixed-movements`, {
        params: { goal_id: goalId },
    }).then(r => r.data);

    const rows = Array.isArray(res?.data) ? res.data : [];
    if (params?.type) {
        return { data: rows.filter(r => r.type === params.type) };
    }
    return { data: rows };
};

export const createRecurringRule = (payload) =>
    api.post(`/fixed-movements`, payload).then(r => r.data);

export const updateRecurringRule = (id, payload) =>
    api.put(`/fixed-movements/${id}`, payload).then(r => r.data);

export const deleteRecurringRule = (id) =>
    api.delete(`/fixed-movements/${id}`).then(r => r.data);

export const pauseRecurringRule = (id) =>
    api.post(`/fixed-movements/${id}/pause`).then(r => r.data);

export const resumeRecurringRule = (id) =>
    api.post(`/fixed-movements/${id}/resume`).then(r => r.data);
