import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/register") return <RegisterPage />;
  if (path === "/forgot-password") return <ForgotPasswordPage />;
  if (path === "/reset-password") return <ResetPasswordPage />;
  return <LoginPage />; // default
}
