import AuthLayout from "../layouts/AuthLayout";
import RegisterForm from "../components/register/RegisterForm";

export default function RegisterPage() {
  const handleSuccess = () => {
    alert("Cuenta creada con éxito. Verifica tu correo para activar la cuenta.");
    window.location.href = "/login";
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Regístrate para planificar tus metas, registrar ingresos y controlar tus gastos"
    >


      <RegisterForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
