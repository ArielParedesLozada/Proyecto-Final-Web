import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import PasswordInput from "../login/PasswordInput";
import { register } from "../../services/auth";

export default function RegisterForm({ onSuccess }) {
  const navigate = useNavigate();
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
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors(e2 => ({ ...e2, [name]: "" }));
  };

  const validate = () => {
    const errors = [];
    
    if (!values.first_name.trim()) errors.push("Nombres requeridos");
    if (!values.last_name.trim()) errors.push("Apellidos requeridos");
    if (!values.email) errors.push("Correo requerido");
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.push("Correo inválido");

    const pwd = values.password;
    if (!pwd) errors.push("Contraseña requerida");
    else if (pwd.length < 8) errors.push("Mínimo 8 caracteres");
    else if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) errors.push("Incluye letras y números");

    if (!values.password_confirmation) errors.push("Confirma tu contraseña");
    else if (values.password_confirmation !== values.password) errors.push("Contraseñas no coinciden");
    
    return errors;
  };

  // Función para verificar si el formulario está completo y válido
  const isFormValid = () => {
    return (
      values.first_name.trim() &&
      values.last_name.trim() &&
      values.email &&
      /^\S+@\S+\.\S+$/.test(values.email) &&
      values.password &&
      values.password.length >= 8 &&
      /[A-Za-z]/.test(values.password) &&
      /\d/.test(values.password) &&
      values.password_confirmation &&
      values.password_confirmation === values.password
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors({}); // Limpiar errores individuales
    setFormError(""); // Limpiar mensaje de error anterior
    
    if (validationErrors.length > 0) {
      setFormError(validationErrors.join("; "));
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      console.log("Sending register data:", values); // Debug log
      const response = await register(values);
      if (response && response.success) {
        // Mostrar mensaje de éxito
        setSuccessMessage("¡Cuenta creada exitosamente! Te hemos enviado un correo de bienvenida. Redirigiendo al login...");
        setFormError("");
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        
        // También llamar onSuccess si existe (para compatibilidad)
        onSuccess?.(response);
      } else {
        setFormError(response?.message || "No se pudo crear la cuenta. Intenta nuevamente.");
      }
    } catch (err) {
      console.log("Register form error:", err); // Debug log
      
      // Manejar errores específicos del backend
      if (err.message.includes("email") && err.message.includes("unique")) {
        setFormError("Ese correo ya está registrado.");
      } else if (err.message.includes("Validation errors:")) {
        // Mostrar los errores específicos de validación
        const specificErrors = err.message.replace("Validation errors: ", "");
        setFormError(`Errores de validación: ${specificErrors}`);
      } else if (err.message.includes("validation")) {
        setFormError("Por favor revisa los datos ingresados.");
      } else {
        setFormError(err.message || "No se pudo crear la cuenta. Intenta nuevamente.");
      }
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

      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input id="first_name" name="first_name" label="Nombres" placeholder="Juan"
               value={values.first_name} onChange={onChange} />
        <Input id="last_name" name="last_name" label="Apellidos" placeholder="Pérez"
               value={values.last_name} onChange={onChange} />
      </div>

      <Input id="email" name="email" type="email" label="Correo electrónico"
             placeholder="usuario@correo.com" value={values.email}
             onChange={onChange} left={<span>@</span>} />

      <label className="block mb-4" htmlFor="password">
        <span className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Contraseña</span>
        <PasswordInput id="password" name="password" placeholder="••••••••"
                       value={values.password} onChange={onChange} />
        <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres, incluye letras y números.</p>
      </label>

      <label className="block mb-4" htmlFor="password_confirmation">
        <span className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Confirmar contraseña</span>
        <PasswordInput id="password_confirmation" name="password_confirmation" placeholder="••••••••"
                       value={values.password_confirmation} onChange={onChange} />
      </label>


      <button type="submit" disabled={loading || successMessage || !isFormValid()}
              className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Creando cuenta..." : successMessage ? "Redirigiendo..." : "Crear cuenta"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta? <a href="/login" className="text-indigo-600 hover:underline">Iniciar sesión</a>
      </p>
    </form>
  );
}
