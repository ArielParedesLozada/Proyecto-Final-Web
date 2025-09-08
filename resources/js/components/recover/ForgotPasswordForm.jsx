import { useState } from "react";
import Input from "../common/Input";
import FormError from "../common/FormError";

// Simulación local (luego reemplazas con services/auth.js)
async function fakeRequestReset(email) {
  await new Promise(r => setTimeout(r, 800));
  // si quieres simular un error:
  // throw new Error("email_not_found");
  return { ok: true };
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return "El correo es obligatorio";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Correo no válido";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setOk("");
    const v = validate();
    setError(v);
    if (v) return;

    setLoading(true);
    try {
      await fakeRequestReset(email);
      setOk("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
    } catch (err) {
      // por seguridad, el mensaje público es neutro
      setOk("Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="text-sm text-gray-600 mb-4">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <FormError message={error} />

      <Input
        id="fp-email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="usuario@correo.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
        left={<span>@</span>}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600
                   hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg"
      >
        {loading ? "Enviando..." : "Enviar enlace"}
      </button>

      {ok && (
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
          {ok}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Recordaste tu contraseña? <a href="/login" className="text-indigo-600 hover:underline">Iniciar sesión</a>
      </p>
    </form>
  );
}
