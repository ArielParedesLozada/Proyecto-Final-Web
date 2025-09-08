import { useState } from "react";
import Input from "../common/Input";
import PasswordInput from "../login/PasswordInput";

// Simulación local (luego se cambia por services/auth.js)
async function fakeRegister(payload) {
  await new Promise(r => setTimeout(r, 700));
  if (payload.email === "existe@demo.com") {
    const err = new Error("email_taken");
    throw err;
  }
  return { ok: true };
}

export default function RegisterForm({ onSuccess }) {
  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    accept: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors(e2 => ({ ...e2, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!values.first_name.trim()) e.first_name = "Nombres obligatorios";
    if (!values.last_name.trim())  e.last_name  = "Apellidos obligatorios";
    if (!values.email) e.email = "Correo obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Correo no válido";

    const pwd = values.password;
    if (!pwd) e.password = "Contraseña obligatoria";
    else if (pwd.length < 8) e.password = "Mínimo 8 caracteres";
    else if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) e.password = "Debe incluir letras y números";

    if (!values.password_confirmation) e.password_confirmation = "Confirma tu contraseña";
    else if (values.password_confirmation !== values.password) e.password_confirmation = "No coinciden";

    if (!values.accept) e.accept = "Debes aceptar los términos";
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const eVal = validate();
    setErrors(eVal);
    if (Object.keys(eVal).length) return;

    setLoading(true);
    setFormError("");

    try {
      await fakeRegister(values); // ← luego: await register(values)
      onSuccess?.();
    } catch (err) {
      setFormError(err.message === "email_taken"
        ? "Ese correo ya está registrado."
        : "No se pudo crear la cuenta. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input id="first_name" name="first_name" label="Nombres" placeholder="Juan"
               value={values.first_name} onChange={onChange} error={errors.first_name} />
        <Input id="last_name" name="last_name" label="Apellidos" placeholder="Pérez"
               value={values.last_name} onChange={onChange} error={errors.last_name} />
      </div>

      <Input id="email" name="email" type="email" label="Correo electrónico"
             placeholder="usuario@correo.com" value={values.email}
             onChange={onChange} error={errors.email} left={<span>@</span>} />

      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700">Contraseña</span>
        <PasswordInput id="password" name="password" placeholder="••••••••"
                       value={values.password} onChange={onChange} />
        {errors.password
          ? <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          : <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres, incluye letras y números.</p>}
      </label>

      <label className="block mb-4" htmlFor="password_confirmation">
        <span className="block mb-1 text-sm text-gray-700">Confirmar contraseña</span>
        <PasswordInput id="password_confirmation" name="password_confirmation" placeholder="••••••••"
                       value={values.password_confirmation} onChange={onChange} />
        {errors.password_confirmation && (
          <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
        )}
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-600 mb-4">
        <input type="checkbox" name="accept" checked={values.accept}
               onChange={onChange} className="mt-1 rounded border-gray-300" />
        <span>
          Acepto los <a href="/terms" className="text-indigo-600 hover:underline">Términos y Condiciones</a> y la{" "}
          <a href="/privacy" className="text-indigo-600 hover:underline">Política de Privacidad</a>.
          {errors.accept && <p className="text-red-600 mt-1">{errors.accept}</p>}
        </span>
      </label>

      <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg">
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/login" className="text-indigo-600 hover:underline">Iniciar sesión</a>
      </p>
    </form>
  );
}
