import api from "./http";

export const listGoals = (params = {}) =>
    api.get("/goals", { params }).then((r) => {
        return r.data;
    });

export const getGoal = (id) =>
    api.get(`/goals/${id}`).then((r) => r.data);

export const createGoal = (payload) =>
    api.post("/goals", payload).then((r) => r.data);

export const updateGoal = (id, payload) =>
    api.put(`/goals/${id}`, payload).then((r) => r.data);

export const deleteGoal = (id) =>
    api.delete(`/goals/${id}`).then((r) => r.data);
