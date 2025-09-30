import api, { BASE, TOKEN_KEY } from "./http";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Normaliza URL: si viene absoluta con BASE, la vuelve relativa para axios
const normalizeUrl = (url) => (url.startsWith(BASE) ? url.slice(BASE.length) : url);

// Wrapper sin auth 
const rawFetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const data =
    typeof options.body === "string" ? JSON.parse(options.body) : options.body;

  try {
    const res = await api.request({
      url: normalizeUrl(url),
      method,
      headers,
      data,
    });

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.data,
      _raw: res,
    };
  } catch (err) {
    const res = err.response;
    return {
      ok: false,
      status: res?.status ?? 500,
      json: async () => res?.data ?? { message: err.message },
      _raw: res,
    };
  }
};

// Wrapper con auth (agrega Authorization si hay token)
const authenticatedFetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  // axios ya agrega el token vía interceptor; este bloque es para
  // mantener compatibilidad por si en algún lugar dependes de ese header aquí:
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const data =
    typeof options.body === "string" ? JSON.parse(options.body) : options.body;

  try {
    const res = await api.request({
      url: normalizeUrl(url),
      method,
      headers,
      data,
    });

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.data,
      _raw: res,
    };
  } catch (err) {
    const res = err.response;
    return {
      ok: false,
      status: res?.status ?? 500,
      json: async () => res?.data ?? { message: err.message },
      _raw: res,
    };
  }
};

/** ---------------------------
 * Auth endpoints (misma lógica)
 * --------------------------- */

export async function login(email, password) {
  try {
    const res = await rawFetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "login_failed");
    }

    const data = await res.json();
    console.log("Login response:", data); // Debug log

    // Mantengo tu misma estructura para guardar el token
    if (data && data.success && data.data && data.data.token) {
      setToken(data.data.token);
    }

    return data;
  } catch (error) {
    console.error("Login error:", error); // Debug log
    throw error;
  }
}

export async function register(payload) {
  try {
    const res = await rawFetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      console.log("Register error response:", error); // Debug log

      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        throw new Error(`Validation errors: ${errorMessages.join(", ")}`);
      }

      throw new Error(error.message || "register_failed");
    }

    const data = await res.json();
    console.log("Register response:", data); // Debug log

    // Mantengo tu UX: no guardar token automático
    return data;
  } catch (error) {
    console.error("Register error:", error); // Debug log
    throw error;
  }
}

export async function logout() {
  try {
    const res = await authenticatedFetch(`${BASE}/logout`, {
      method: "POST",
    });

    // Remover el token independientemente de la respuesta del servidor
    removeToken();

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "logout_failed");
    }

    return await res.json();
  } catch (error) {
    // Aun así removemos el token localmente
    removeToken();
    throw error;
  }
}

export async function getProfile() {
  const res = await authenticatedFetch(`${BASE}/profile`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "profile_failed");
  }

  return await res.json();
}

export async function updateProfile(payload) {
  const res = await authenticatedFetch(`${BASE}/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "update_profile_failed");
  }

  return await res.json();
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated() {
  return !!getToken();
}

// Funciones para obtener/guardar/remover token (mismas exportaciones)
export { getToken, setToken, removeToken };
export async function requestPasswordReset(email) {
  try {
    const res = await rawFetch(`${BASE}/password/reset-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Request password reset error response:", error);

      if (error.errors) {
        const errorMessages = [];
        for (const field in error.errors) {
          errorMessages.push(error.errors[field].join(", "));
        }
        throw new Error(errorMessages.join("; "));
      }

      throw new Error(error.message || "Error al solicitar código de verificación");
    }

    return await res.json();
  } catch (error) {
    console.error("Request password reset error:", error);
    throw error;
  }
}

export async function verifyResetCode(email, code) {
  try {
    const res = await rawFetch(`${BASE}/password/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al verificar código");
    }

    return await res.json();
  } catch (error) {
    console.error("Verify reset code error:", error);
    throw error;
  }
}

export async function getGoogleAuthUrl() {
  try {
    const res = await rawFetch(`${BASE}/auth/google/url`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Error al obtener URL de Google");
    }

    return await res.json();
  } catch (error) {
    console.error("Get Google URL error:", error);
    throw error;
  }
}

export async function resetPassword(email, code, password, passwordConfirmation) {
  try {
    const res = await rawFetch(`${BASE}/password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Reset password error response:", error);

      if (error.errors) {
        const errorMessages = [];
        for (const field in error.errors) {
          errorMessages.push(error.errors[field].join(", "));
        }
        throw new Error(`Por favor, revisa los siguientes errores: ${errorMessages.join("; ")}`);
      }

      throw new Error(error.message || "Error al restablecer contraseña");
    }

    return await res.json();
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}
