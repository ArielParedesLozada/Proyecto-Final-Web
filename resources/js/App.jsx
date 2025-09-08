// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige / hacia /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/goals" element={<GoalsPage />} />

        {/* Rutas futuras (ejemplo de placeholders) */}
        {/* <Route path="/goals" element={<GoalsPage />} /> */}
        {/* <Route path="/transactions" element={<TransactionsPage />} /> */}
        {/* <Route path="/analytics" element={<AnalyticsPage />} /> */}
        {/* <Route path="/history" element={<HistoryPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}

        {/* Ruta por defecto si no coincide */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
