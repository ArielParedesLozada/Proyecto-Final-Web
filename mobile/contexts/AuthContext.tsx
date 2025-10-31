import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { isAuthenticated, getProfile, logout as authLogout } from '../services/auth';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_image_url?: string;
  email_verified_at?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Normaliza el objeto user y garantiza full_name
function normalizeUser(user: any): User | null {
  if (!user) return null;
  const first = (user.first_name || '').trim();
  const last = (user.last_name || '').trim();
  const full = (user.full_name || '').trim();
  const full_name = (full || `${first} ${last}`.trim()) || user.name || '';

  return { ...user, full_name };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      if (await isAuthenticated()) {
        try {
          const response = await getProfile();
          if (response?.success) {
            setUser(normalizeUser(response.data.user) || null);
          } else {
            await authLogout();
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          await authLogout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(normalizeUser(userData) || null);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => normalizeUser({ ...(prev || {}), ...(partial || {}) }) || null);
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

