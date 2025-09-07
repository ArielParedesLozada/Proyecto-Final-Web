import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/register") {
    return <RegisterPage />;
  }

  // por defecto muestra el login
  return <LoginPage />;
}
