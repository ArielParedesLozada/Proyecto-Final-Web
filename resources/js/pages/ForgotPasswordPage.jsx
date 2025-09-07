import AuthLayout from "../layouts/AuthLayout";
import ForgotPasswordForm from "../components/recover/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para que puedas restablecer tu contraseña"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
