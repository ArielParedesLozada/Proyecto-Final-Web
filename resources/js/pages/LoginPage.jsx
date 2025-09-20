import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/login/LoginForm";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (response) => {
    // El token ya se guardó en el servicio de auth
    // Ahora actualizamos el contexto con los datos del usuario
    if (response.data?.user) {
      login(response.data.user);
    }
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede para planificar tus metas, registrar ingresos y controlar gastos"
    >
      <LoginForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
