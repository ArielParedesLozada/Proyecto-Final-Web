import { useState, useEffect } from "react";
import Input from "../common/Input";
import { requestPasswordReset } from "../../services/auth";

export default function RequestResetCode({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setSuccess("Código de verificación enviado a tu correo electrónico");
        onSuccess?.(email);
      } else {
        setError(response.message || "Error al enviar el código");
      }
    } catch (err) {
      setError(err.message || "Error al enviar el código de verificación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
          {success}
        </div>
      )}


      <Input
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="usuario@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        left={<span>@</span>}
        required
      />

      <button
        type="submit"
        disabled={loading || success}
        className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando código..." : success ? "Código enviado" : "Enviar código"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Recordaste tu contraseña?{" "}
        <a href="/login" className="text-indigo-600 hover:underline">
          Iniciar sesión
        </a>
      </p>
    </form>
  );
}
