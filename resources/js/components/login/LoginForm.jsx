import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import FormError from "../common/FormError";
import PasswordInput from "./PasswordInput";

// Simulación local: reemplázalo por services/auth.js cuando conecten backend
async function fakeLogin({ email, password }) {
  await new Promise(r => setTimeout(r, 700));
  // Puedes fallar si quieres probar errores:
  if (email === "fail@demo.com") throw new Error("invalid");
  return { token: "demo-token", email };
}

export default function LoginForm({ onSuccess }) {
  const [values, setValues] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors(e2 => ({ ...e2, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!values.email) e.email = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Correo no válido";
    if (!values.password) e.password = "La contraseña es obligatoria";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eVal = validate();
    setErrors(eVal);
    if (Object.keys(eVal).length) return;

    setLoading(true);
    setFormError("");

    try {
      // Sustituir por: const res = await login(values.email, values.password);
      await fakeLogin(values);
      onSuccess?.();
    } catch {
      setFormError("Credenciales inválidas. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormError message={formError} />

      <Input
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="usuario@correo.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        hint="Usa el correo con el que verificaste tu cuenta"
        left={<span>@</span>}
      />

      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700">Contraseña</span>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </label>

      <div className="mb-4 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="remember"
            checked={values.remember}
            onChange={handleChange}
            className="rounded border-gray-300"
          />
          Recordarme
        </label>
        <a href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" loading={loading}>Ingresar</Button>

      <div className="mt-4">
        <Button type="button" variant="ghost" onClick={() => alert("Demo: SSO pronto")}>
          Ingresar con SSO (próximamente)
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta? <a href="/register" className="text-indigo-600 hover:underline">Crear cuenta</a>
      </p>
    </form>
  );
}
