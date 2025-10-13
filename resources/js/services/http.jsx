import axios from "axios";

export const BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:8000/api";

export const TOKEN_KEY = "jwt_token";

const api = axios.create({
    baseURL: BASE,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
