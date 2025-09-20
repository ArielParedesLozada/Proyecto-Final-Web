// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsPage from "./pages/StatsPage";

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Componente para rutas de autenticación (solo para usuarios no autenticados)
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Redirige / hacia /dashboard si está autenticado, sino a /login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rutas de autenticación (solo para usuarios no autenticados) */}
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <RegisterPage />
        </AuthRoute>
      } />
      <Route path="/forgot-password" element={
        <AuthRoute>
          <ForgotPasswordPage />
        </AuthRoute>
      } />

      {/* Rutas protegidas (solo para usuarios autenticados) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/statistics" element={
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Ruta por defecto si no coincide */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
