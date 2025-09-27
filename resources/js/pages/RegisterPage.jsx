import AuthLayout from "../layouts/AuthLayout";
import RegisterForm from "../components/register/RegisterForm";

export default function RegisterPage() {
  // El RegisterForm ahora maneja la redirección automáticamente
  // No necesitamos lógica adicional aquí

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para planificar tus metas, registrar ingresos y controlar tus gastos"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
