const BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:8000/api";

// Función para obtener el token del localStorage
const getToken = () => localStorage.getItem('jwt_token');

// Función para guardar el token en localStorage
const setToken = (token) => localStorage.setItem('jwt_token', token);

// Función para remover el token del localStorage
const removeToken = () => localStorage.removeItem('jwt_token');

// Función para hacer requests autenticados
const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
};

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE}/login`, {
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
    
    // Guardar el token si el login fue exitoso
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
    const res = await fetch(`${BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.log("Register error response:", error); // Debug log
      
      // Si hay errores de validación específicos, mostrarlos
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        throw new Error(`Validation errors: ${errorMessages.join(', ')}`);
      }
      
      throw new Error(error.message || "register_failed");
    }
    
    const data = await res.json();
    console.log("Register response:", data); // Debug log
    
    // NO guardar el token automáticamente - el usuario debe hacer login manualmente
    // Esto es mejor para la seguridad y UX
    
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
    // Aún así removemos el token localmente
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

// Función para obtener el token actual
export { getToken, setToken, removeToken };

// Solicitar código de verificación para restablecer contraseña
export async function requestPasswordReset(email) {
  try {
    const res = await fetch(`${BASE}/password/reset-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al solicitar código de verificación");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Request password reset error:", error);
    throw error;
  }
}

// Verificar código de restablecimiento
export async function verifyResetCode(email, code) {
  try {
    const res = await fetch(`${BASE}/password/verify-code`, {
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

// Restablecer contraseña con código de verificación
export async function resetPassword(email, code, password, passwordConfirmation) {
  try {
    const res = await fetch(`${BASE}/password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        code, 
        password, 
        password_confirmation: passwordConfirmation 
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error("Reset password error response:", error);
      
      // Si hay errores de validación específicos, mostrarlos
      if (error.errors) {
        const errorMessages = [];
        for (const field in error.errors) {
          errorMessages.push(`${field}: ${error.errors[field].join(', ')}`);
        }
        throw new Error(`Errores de validación: ${errorMessages.join('; ')}`);
      }
      
      throw new Error(error.message || "Error al restablecer contraseña");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}
