import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import PasswordInput from "../login/PasswordInput";
import { verifyResetCode, resetPassword } from "../../services/auth";

export default function ResetPasswordForm({ email, onBack }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("verify"); // "verify" o "reset"
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyResetCode(email, code);
      if (response.success) {
        setCodeVerified(true);
        setStep("reset");
      } else {
        setError(response.message || "Código inválido");
      }
    } catch (err) {
      setError(err.message || "Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(email, code, password, passwordConfirmation);
      if (response.success) {
        setSuccess("Contraseña restablecida exitosamente. Redirigiendo al login...");
        setLoading(false); // Importante: detener el loading aquí
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.message || "Error al restablecer la contraseña");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <form onSubmit={handleVerifyCode} noValidate>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificar código
          </h2>
          <p className="text-gray-600">
            Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
          </p>
        </div>

        <Input
          id="code"
          name="code"
          label="Código de verificación"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
        />

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Verificar código"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full mt-3 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          Volver
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword} noValidate>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {codeVerified && !success && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
          Código verificado correctamente
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nueva contraseña
        </h2>
        <p className="text-gray-600">
          Crea una nueva contraseña segura para tu cuenta
        </p>
      </div>

      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700">Nueva contraseña</span>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={success}
        />
        <p className="mt-1 text-xs text-gray-500">
          Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números.
        </p>
      </label>

      <label className="block mb-4" htmlFor="password_confirmation">
        <span className="block mb-1 text-sm text-gray-700">Confirmar contraseña</span>
        <PasswordInput
          id="password_confirmation"
          name="password_confirmation"
          placeholder="••••••••"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          disabled={success}
        />
      </label>

      <button
        type="submit"
        disabled={loading || success || !password || !passwordConfirmation || password !== passwordConfirmation}
        className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Restableciendo..." : success ? "Redirigiendo..." : "Restablecer contraseña"}
      </button>

      <button
        type="button"
        onClick={() => setStep("verify")}
        className="w-full mt-3 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
      >
        Volver a verificar código
      </button>
    </form>
  );
}
