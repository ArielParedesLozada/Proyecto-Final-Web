import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import PasswordInput from "../login/PasswordInput";
import { verifyResetCode, resetPassword, getCodeTimeRemaining, requestPasswordReset } from "../../services/auth";

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
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss codeVerified message after 5 seconds
  useEffect(() => {
    if (codeVerified) {
      const timer = setTimeout(() => {
        setCodeVerified(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [codeVerified]);

  // Contador de tiempo restante
  useEffect(() => {
    const fetchTimeRemaining = async () => {
      try {
        console.log("Fetching time remaining for email:", email);
        const response = await getCodeTimeRemaining(email);
        console.log("Full response from server:", response);
        
        if (response.success) {
          console.log("Time remaining from server:", response.time_remaining);
          console.log("Expired status:", response.expired);
          setTimeRemaining(response.time_remaining);
          setCanResend(response.expired);
        } else {
          console.log("No valid code found, setting to expired");
          setTimeRemaining(0);
          setCanResend(true);
        }
      } catch (err) {
        console.error("Error fetching time remaining:", err);
        console.error("Error details:", err.response?.data);
        setTimeRemaining(0);
        setCanResend(true);
      }
    };

    // Obtener tiempo inicial del servidor
    fetchTimeRemaining();

    // Actualizar cada segundo
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email]);

  // Función para formatear el tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Función para reenviar código
  const handleResendCode = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setSuccess("Código reenviado exitosamente");
        
        // Obtener el tiempo real del servidor después de reenviar
        try {
          const timeResponse = await getCodeTimeRemaining(email);
          if (timeResponse.success) {
            setTimeRemaining(timeResponse.time_remaining);
            setCanResend(timeResponse.expired);
          }
        } catch (timeErr) {
          console.error("Error getting time after resend:", timeErr);
          setTimeRemaining(180); // Fallback a 3 minutos
          setCanResend(false);
        }
      } else {
        setError(response.message || "Error al reenviar el código");
      }
    } catch (err) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setResending(false);
    }
  };

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

        {/* Contador de tiempo */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tiempo restante: <span className="font-semibold text-indigo-600">{formatTime(timeRemaining)}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Verificar código"}
        </button>

        {/* Botón de reenviar código */}
        {canResend && (
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending}
            className="w-full mt-3 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Reenviando..." : "Reenviar código"}
          </button>
        )}

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


      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Nueva contraseña</span>
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
        <span className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Confirmar contraseña</span>
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

    </form>
  );
}
