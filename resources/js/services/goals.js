import api from "./http";
import { CAT_UI_TO_API, STATUS_UI_TO_API } from "./adapters";

function buildQueryParams(args = {}) {
    const hasStructured = "pageSize" in args || "filters" in args;
    if (!hasStructured) {
        const q = {};
        Object.entries(args).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") return;
            q[k] = v;
        });
        return q;
    }

    const {
        page = 1,
        pageSize = 10,
        filters = {},
        ...rest
    } = args;

    const {
        search = "",
        categoria = "",
        estados = [],       
        creadaDesde = "",
        venceHasta = "",
        vence7dias = false,
    } = filters;

    const categoriaApi = categoria ? (CAT_UI_TO_API[categoria] ?? "") : "";
    const estadosApi = Array.isArray(estados)
        ? estados
            .map((ui) => STATUS_UI_TO_API[ui])
            .filter(Boolean)
        : [];

    const params = {
        page,
        per_page: pageSize,
        search: search || undefined,
        categoria: categoriaApi || undefined,
        estado: estadosApi.length ? estadosApi.join(",") : undefined, 
        creada_desde: creadaDesde || undefined,
        vence_hasta: venceHasta || undefined,
        vence_7_dias: typeof vence7dias === "boolean" ? (vence7dias ? "1" : "0") : undefined,
        ...rest,
    };

    Object.keys(params).forEach((k) => {
        if (params[k] === undefined || params[k] === null || params[k] === "") {
            delete params[k];
        }
    });

    return params;
}

export const listGoals = (args = {}) =>
    api.get("/goals", { params: buildQueryParams(args) }).then((r) => r.data);

export const listGoalsHistory = (args = {}) =>
    api.get("/goals/history", { params: buildQueryParams(args) }).then((r) => r.data);

export const getGoal = (id) =>
    api.get(`/goals/${id}`).then((r) => r.data);

export const createGoal = (payload) =>
    api.post("/goals", payload).then((r) => r.data);

export const updateGoal = (id, payload) =>
    api.put(`/goals/${id}`, payload).then((r) => r.data);

export const deleteGoal = (id) =>
    api.delete(`/goals/${id}`).then((r) => r.data);
