import * as Linking from 'expo-linking';
import api from './api';
import { storage, TOKEN_KEY } from './storage';

// Funciones para manejar el token
const getToken = async () => await storage.getItem(TOKEN_KEY);
const setToken = async (token: string) => await storage.setItem(TOKEN_KEY, token);
const removeToken = async () => await storage.removeItem(TOKEN_KEY);

// Login
export async function login(email: string, password: string) {
  try {
    const response = await api.post('/login', { email, password });

    if (response.data?.success && response.data?.data?.token) {
      await setToken(response.data.data.token);
      return response.data;
    }

    throw new Error(response.data?.message || 'Error al iniciar sesión');
  } catch (error: any) {
    console.error('Login error:', error);
    const message =
      error.response?.data?.message ||
      error.message ||
      'Credenciales inválidas. Inténtalo nuevamente.';
    throw new Error(message);
  }
}

// Registro
export async function register(payload: {
  profile_image_url: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  try {
    if (payload.profile_image_url && payload.profile_image_url.length > 1000000) { // 1MB
      throw new Error('La imagen es demasiado grande. Por favor, selecciona una imagen más pequeña.');
    }
    
    const response = await api.post('/register', payload);

    if (response.data?.success && response.data?.data?.token) {
      await setToken(response.data.data.token);
      return response.data;
    }

    throw new Error(response.data?.message || 'Error al registrar');
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(`Errores de validación: ${errorMessages.join(', ')}`);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Error al registrar usuario';
    throw new Error(message);
  }
}

// Logout
export async function logout() {
  try {
    const token = await getToken();
    if (token) {
      await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await removeToken();
  }
}

// Obtener perfil
export async function getProfile() {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error: any) {
    console.error('Get profile error:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener perfil');
  }
}

// Actualizar perfil
export async function updateProfile(payload: any) {
  try {
    const response = await api.put('/profile', payload);
    return response.data;
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(errorMessages.join('; '));
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al actualizar perfil'
    );
  }
}

// Verificar si está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

// Solicitar recuperación de contraseña
export async function requestPasswordReset(email: string) {
  try {
    const response = await api.post('/password/reset-request', { email });
    return response.data;
  } catch (error: any) {
    console.error('Request password reset error:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(errorMessages.join('; '));
    }

    throw new Error(
      error.response?.data?.message ||
      'Error al solicitar código de verificación'
    );
  }
}

// Verificar código de recuperación
export async function verifyResetCode(email: string, code: string) {
  try {
    const response = await api.post('/password/verify-code', { email, code });
    return response.data;
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    throw new Error(
      error.response?.data?.message || 'Error al verificar código'
    );
  }
}

// Restablecer contraseña
export async function resetPassword(
  email: string,
  code: string,
  password: string,
  passwordConfirmation: string
) {
  try {
    const response = await api.post('/password/reset', {
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      Object.values(error.response.data.errors).forEach((err: any) => {
        if (Array.isArray(err)) {
          errorMessages.push(...err);
        } else {
          errorMessages.push(err);
        }
      });
      throw new Error(`Por favor, revisa los siguientes errores: ${errorMessages.join('; ')}`);
    }

    throw new Error(
      error.response?.data?.message || 'Error al restablecer contraseña'
    );
  }
}

export { getToken, setToken, removeToken };

export async function getGoogleAuthUrl(redirectTo?: string) {
  try {
    const response = await api.get('/auth/google/url', {
      params: {
        ...(redirectTo ? { redirect_to: redirectTo } : {}),
        prompt: 'select_account',
        access_type: 'offline',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Get Google auth URL error:', error);
    throw new Error(
      error.response?.data?.message || 'No se pudo obtener la URL de Google'
    );
  }
}

export function parseGoogleCallback(url: string) {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams ?? {};

  const token = typeof params.token === 'string' ? params.token : undefined;
  const errorParam = typeof params.error === 'string' ? params.error : undefined;
  const userParam = typeof params.user === 'string' ? params.user : undefined;

  let user: any = null;

  if (userParam) {
    try {
      user = JSON.parse(decodeURIComponent(userParam));
    } catch (err) {
      console.error('Error parsing Google user payload:', err);
    }
  }

  return {
    token,
    user,
    error: errorParam ? decodeURIComponent(errorParam) : undefined,
  };
}

