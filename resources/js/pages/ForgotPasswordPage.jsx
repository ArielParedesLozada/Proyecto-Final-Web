import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import RequestResetCode from "../components/auth/RequestResetCode";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request"); // "request" o "reset"

  const handleCodeSent = (userEmail) => {
    setEmail(userEmail);
    setStep("reset");
  };

  const handleBack = () => {
    setStep("request");
    setEmail("");
  };

  return (
    <AuthLayout 
      title="Recuperar contraseña" 
      subtitle="Te ayudaremos a restablecer tu contraseña de forma segura"
      step={step} 
      email={email}
    >
      {step === "request" ? (
        <RequestResetCode onSuccess={handleCodeSent} />
      ) : (
        <ResetPasswordForm email={email} onBack={handleBack} />
      )}
    </AuthLayout>
  );
}