// resources/js/services/API.jsx
import axios from "axios";

/** 1) Base URL desde .env, cae a localhost si no existe */
export const BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";

/** 2) Instancia axios (igual a la tuya) */
const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

/** 3) (Opcional pero útil) Token automático si lo guardas en localStorage */
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;

/* -------------------------------------------
   GOALS API (real vs mock) con la MISMA interfaz
------------------------------------------- */

/** REAL: llama a tu backend Laravel */
const realGoals = {
  list: ({ page = 1, pageSize = 6 } = {}) =>
    api
      .get("/api/goals", { params: { page, pageSize } })
      .then((r) => r.data), // => { data, total, page, pageSize }

  create: (payload) =>
    api.post("/api/goals", payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/api/goals/${id}`, payload).then((r) => r.data),

  remove: (id) =>
    api.delete(`/api/goals/${id}`).then((r) => r.data),
};

/** MOCK: usa localStorage con misma forma de respuesta */
const LS_KEY = "__goals__";

function readLS() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLS(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/* Semilla inicial de ejemplo si no hay datos */
if (!localStorage.getItem(LS_KEY)) {
  writeLS([
    {
      id: 1,
      name: "Vacaciones de Verano",
      category: "Viaje/Educa",
      description: "Viaje familiar a la playa",
      targetAmount: 5000,
      currentAmount: 3200,
      status: "Activa",
      createdAt: "2024-01-14",
    },
    {
      id: 2,
      name: "Fondo de Emergencia",
      category: "Emergencia",
      description: "",
      targetAmount: 10000,
      currentAmount: 7500,
      status: "Activa",
      createdAt: "2024-02-20",
    },
  ]);
}

const mockGoals = {
  async list({ page = 1, pageSize = 6 } = {}) {
    const data = readLS();
    const total = data.length;
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);
    return { data: pageData, total, page, pageSize };
  },

  async create(payload) {
    const data = readLS();
    const id = (data.reduce((m, g) => Math.max(m, g.id), 0) || 0) + 1;
    const item = {
      id,
      currentAmount: 0,
      status: "Activa",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    writeLS([item, ...data]);
    return item;
  },

  async update(id, payload) {
    const data = readLS();
    const idx = data.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error("not_found");
    data[idx] = { ...data[idx], ...payload };
    writeLS(data);
    return data[idx];
  },

  async remove(id) {
    const data = readLS().filter((g) => g.id !== id);
    writeLS(data);
    return { ok: true };
  },
};

/** 4) Selector por .env (mock por defecto para que desarrolles front) */
const useMock =
  (import.meta.env?.VITE_USE_MOCK_GOALS ?? "true").toString() === "true";

export const GoalsAPI = useMock ? mockGoals : realGoals;
