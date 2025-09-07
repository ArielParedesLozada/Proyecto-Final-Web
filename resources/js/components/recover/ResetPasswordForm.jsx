import { useMemo, useState } from "react";
import PasswordInput from "../login/PasswordInput";
import FormError from "../common/FormError";

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

// Simulación local (luego reemplazas con services/auth.js)
async function fakeResetPassword({ token, email, password }) {
  await new Promise(r => setTimeout(r, 800));
  if (!token) throw new Error("invalid_token");
  return { ok: true };
}

export default function ResetPasswordForm() {
  const q = useQuery();
  const presetEmail = q.get("email") ?? "";
  const token = q.get("token") ?? "";

  const [values, setValues] = useState({
    email: presetEmail,
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!values.email) return "El correo es obligatorio";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return "Correo no válido";
    const pwd = values.password;
    if (!pwd) return "La contraseña es obligatoria";
    if (pwd.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) return "Debe incluir letras y números";
    if (values.password !== values.password_confirmation) return "Las contraseñas no coinciden";
    if (!token) return "El enlace no es válido o expiró";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;

    setLoading(true);
    setOk("");
    try {
      await fakeResetPassword({ token, email: values.email, password: values.password });
      setOk("Tu contraseña fue actualizada. Ahora puedes iniciar sesión.");
    } catch (err) {
      setError("No se pudo restablecer la contraseña. Solicita un nuevo enlace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormError message={error} />

      <label className="block mb-4" htmlFor="email">
        <span className="block mb-1 text-sm text-gray-700">Correo electrónico</span>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          className="w-full rounded-lg border bg-white/90 px-3 py-2 text-sm placeholder:text-gray-400
                     border-gray-300/80 focus:border-gray-400
                     focus-visible:ring-2 focus-visible:ring-indigo-600/30 ring-offset-2 ring-offset-white
                     transition outline-none"
          placeholder="usuario@correo.com"
        />
      </label>

      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700">Nueva contraseña</span>
        <PasswordInput
          id="password"
          name="password"
          value={values.password}
          onChange={onChange}
          placeholder="••••••••"
        />
      </label>

      <label className="block mb-6" htmlFor="password_confirmation">
        <span className="block mb-1 text-sm text-gray-700">Confirmar nueva contraseña</span>
        <PasswordInput
          id="password_confirmation"
          name="password_confirmation"
          value={values.password_confirmation}
          onChange={onChange}
          placeholder="••••••••"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600
                   hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg"
      >
        {loading ? "Actualizando..." : "Restablecer contraseña"}
      </button>

      {ok && (
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
          {ok} <a href="/login" className="underline">Iniciar sesión</a>
        </div>
      )}
    </form>
  );
}
