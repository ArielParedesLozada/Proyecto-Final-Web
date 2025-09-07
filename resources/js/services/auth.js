const BASE = import.meta.env?.VITE_API_URL ?? "/api";

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("login_failed");
  return res.json(); // {token, user}
}

export async function register(payload) {
  const BASE = import.meta.env?.VITE_API_URL ?? "/api";
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("register_failed");
  return res.json();
}
