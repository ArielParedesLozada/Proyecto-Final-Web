import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/login/LoginForm";

export default function LoginPage() {
  const handleSuccess = () => {
    // Luego se reemplaza por redirección real tras guardar token
    window.location.href = "/dashboard";
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
