import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { isAuthenticated, getProfile, logout as authLogout } from '../services/auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Normaliza el objeto user y garantiza full_name
function normalizeUser(user) {
  if (!user) return null;
  const first = (user.first_name || '').trim();
  const last = (user.last_name || '').trim();
  const full = (user.full_name || '').trim();
  const full_name = (full || `${first} ${last}`.trim()) || user.name || '';

  return { ...user, full_name };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await getProfile();
          if (response?.success) {
            setUser(normalizeUser(response.data.user));
          } else {
            authLogout();
            setUser(null);
          }
        } catch {
          authLogout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(normalizeUser(userData));
  };

  const updateUser = (partial) => {
    setUser(prev => normalizeUser({ ...(prev || {}), ...(partial || {}) }));
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

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,        
    isAuthenticated: !!user,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
