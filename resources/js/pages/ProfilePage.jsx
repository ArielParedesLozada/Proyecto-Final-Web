import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import { ToastProvider, useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/profile";
import PasswordInput from "../components/login/PasswordInput";
import useCache from "../hooks/useCache";

/* --- Subcomponentes pequeños para mantener orden --- */
function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Field({ id, label, children, hint, className = "" }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="block text-sm mb-1">{label}</span>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </label>
  );
}

function AvatarReadOnly({ nameFull = "Usuario", initials = "U" }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-primary-600 text-white grid place-items-center text-xl font-semibold ring-1 ring-black/5 shadow">
        {initials || "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p 
          className="font-semibold leading-tight truncate" 
          title={nameFull}
        >
          {nameFull}
        </p>
        <p className="text-sm text-gray-500">Avatar del usuario (no editable)</p>
      </div>
    </div>
  );
}

/* --- Página (inner) --- */
function ProfilePageInner() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { updateUser } = useAuth();
  const { fetchWithCache, invalidateCache } = useCache();

  // Estado datos de la cuenta
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // Valores originales para comparar cambios
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  // Cambio de contraseña
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  // Flags
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cargar perfil
  useEffect(() => {
    (async () => {
      try {
        const p = await fetchWithCache('user-profile', () => getProfile());
        if (p) {
          setFirstName(p.first_name || "");
          setLastName(p.last_name || "");
          setEmail(p.email || "");
          
          // Guardar valores originales
          setOriginalFirstName(p.first_name || "");
          setOriginalLastName(p.last_name || "");
          setOriginalEmail(p.email || "");
          
          setUser?.((prev) => ({
            ...(prev || {}),
            ...p,
            full_name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
          }));
        }
      } catch (e) {
        toast.push({ tone: "error", title: "No se pudo cargar tu perfil" });
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = useMemo(() => {
    const a = (firstName || "").trim()[0] || "";
    const b = (lastName || "").trim()[0] || "";
    return (a + b).toUpperCase() || "U";
  }, [firstName, lastName]);

  // Función para verificar si hay cambios en los datos de la cuenta
  const hasAccountChanges = useMemo(() => {
    return (
      firstName.trim() !== originalFirstName ||
      lastName.trim() !== originalLastName ||
      email.trim() !== originalEmail
    );
  }, [firstName, lastName, email, originalFirstName, originalLastName, originalEmail]);

  // Función para verificar si se puede cambiar la contraseña
  const canChangePassword = useMemo(() => {
    // Verificar que todos los campos estén llenos
    if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
      return false;
    }
    
    // Verificar que las contraseñas coincidan
    if (newPwd !== confirmPwd) {
      return false;
    }
    
    // Verificar que la nueva contraseña sea diferente a la actual
    if (currentPwd === newPwd) {
      return false;
    }
    
    // Verificar que la nueva contraseña cumpla los requisitos
    if (newPwd.length < 8) {
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPwd)) {
      return false;
    }
    
    return true;
  }, [currentPwd, newPwd, confirmPwd]);

  // Validación en tiempo real de contraseñas
  const validatePassword = (field, value) => {
    const errors = { ...passwordErrors };
    
    if (field === 'password') {
      if (value && value.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres";
      } else if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        errors.password = "Debe incluir mayúsculas, minúsculas y números";
      } else if (value && currentPwd && value === currentPwd) {
        errors.password = "La nueva contraseña debe ser diferente a la actual";
      } else {
        errors.password = "";
      }
    }
    
    if (field === 'password_confirmation') {
      if (value && newPwd && value !== newPwd) {
        errors.password_confirmation = "Las contraseñas no coinciden";
      } else {
        errors.password_confirmation = "";
      }
    }
    
    if (field === 'password' && confirmPwd) {
      if (confirmPwd && value !== confirmPwd) {
        errors.password_confirmation = "Las contraseñas no coinciden";
      } else {
        errors.password_confirmation = "";
      }
    }
    
    // Si cambia la contraseña actual, revalidar la nueva
    if (field === 'current_password' && newPwd) {
      if (newPwd === value) {
        errors.password = "La nueva contraseña debe ser diferente a la actual";
      } else {
        errors.password = "";
      }
    }
    
    setPasswordErrors(errors);
  };

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Perfil</h1>
      <p className="text-sm text-gray-500">
        Administra tu información de cuenta y seguridad
      </p>
    </div>
  );

  // Guardar datos de la cuenta
  async function handleSaveAccount(e) {
    e.preventDefault();
    setSaving(true);

    const nextFirst = firstName.trim();
    const nextLast = lastName.trim();
    const nextEmail = email.trim();

    try {
      const updated = await updateProfile({
        first_name: nextFirst,
        last_name: nextLast,
        email: nextEmail,
      });

      updateUser({
        ...(updated || {}),
        first_name: nextFirst,
        last_name: nextLast,
        email: nextEmail,
        full_name: `${nextFirst} ${nextLast}`.trim(),
      });

      // Actualizar valores originales
      setOriginalFirstName(nextFirst);
      setOriginalLastName(nextLast);
      setOriginalEmail(nextEmail);

      // Invalidar caché del perfil
      invalidateCache('user-profile');

      toast.push({ tone: "success", title: "Cambios guardados" });
    } catch (err) {
      console.error("Profile save error:", err);
      
      // Manejar errores específicos
      let errorMessage = "No se pudo guardar.";
      
      if (err.response?.data?.errors) {
        // Errores de validación del backend
        const errorMessages = [];
        for (const field in err.response.data.errors) {
          errorMessages.push(err.response.data.errors[field].join(", "));
        }
        errorMessage = errorMessages.join("; ");
      } else if (err.response?.data?.message) {
        // Mensaje directo del backend
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // Mensaje del error de JavaScript
        errorMessage = err.message;
      }
      
      toast.push({ tone: "error", title: "Error al guardar", message: errorMessage });
    } finally {
      setSaving(false);
    }
  }

  // Cambiar contraseña
  async function handleChangePassword(e) {
    e.preventDefault();
    
    setChanging(true);
    try {
      await changePassword({
        current_password: currentPwd,
        password: newPwd,
        password_confirmation: confirmPwd,
      });
      toast.push({ tone: "success", title: "Contraseña actualizada" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      console.error("Change password error:", err);
      
      // Mostrar errores como notificaciones
      if (err.message && err.message.includes(";")) {
        // Múltiples errores - mostrar el primero como notificación
        const errorMessages = err.message.split("; ");
        toast.push({ tone: "error", title: "Error de validación", message: errorMessages[0] });
      } else if (err.message && (
        err.message.includes("contraseña debe") || 
        err.message.includes("contraseña actual") ||
        err.message.includes("coinciden") ||
        err.message.includes("mínimo 8 caracteres") ||
        err.message.includes("incorrecta")
      )) {
        // Error de validación específico - mostrar como notificación
        toast.push({ tone: "error", title: "Error de validación", message: err.message });
      } else {
        // Error general
        toast.push({ tone: "error", title: "Error", message: err.message });
      }
    } finally {
      setChanging(false);
    }
  }

  if (!loaded) {
    return (
      <AppLayout header={header}>
        <ResponsivePane>
          <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
            Cargando perfil…
          </div>
        </ResponsivePane>
      </AppLayout>
    );
  }

  return (
    <AppLayout header={header}>
      <ResponsivePane toolbar={null}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Columna izquierda */}
          <aside className="xl:col-span-1">
            <section className="fin-card p-5 md:p-6">
              <SectionHeader title="Identidad" />
              <div className="mt-4">
                <AvatarReadOnly
                  nameFull={`${firstName} ${lastName}`.trim() || "Usuario"}
                  initials={initials}
                />
              </div>
            </section>
          </aside>

          {/* Columna derecha */}
          <main className="xl:col-span-2 space-y-5">
            {/* Datos de la cuenta */}
            <form onSubmit={handleSaveAccount} className="fin-card p-5 md:p-6">
              <SectionHeader
                title="Datos de la cuenta"
                subtitle="Información básica para identificar tu perfil."
                right={
                  <button
                    type="submit"
                    className="btn btn-primary disabled:opacity-60"
                    disabled={saving || !hasAccountChanges}
                  >
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </button>
                }
              />

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="firstName" label="Nombre">
                  <input
                    id="firstName"
                    className="input-base"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </Field>

                <Field id="lastName" label="Apellido">
                  <input
                    id="lastName"
                    className="input-base"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Tu apellido"
                  />
                </Field>

                <Field id="email" label="Correo" className="md:col-span-2">
                  <input
                    id="email"
                    className="input-base"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                  />
                </Field>
              </div>
            </form>

            {/* Seguridad */}
            <form onSubmit={handleChangePassword} className="fin-card p-5 md:p-6">
              <SectionHeader
                title="Seguridad"
                subtitle="Actualiza tu contraseña periódicamente."
              />

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field id="pwd-current" label="Actual">
                  <PasswordInput
                    id="pwd-current"
                    name="current_password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>

                <Field id="pwd-new" label="Nueva" hint="Mínimo 8 caracteres.">
                  <PasswordInput
                    id="pwd-new"
                    name="new_password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </Field>

                <Field id="pwd-confirm" label="Confirmar">
                  <PasswordInput
                    id="pwd-confirm"
                    name="confirm_password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setCurrentPwd("");
                    setNewPwd("");
                    setConfirmPwd("");
                    setPasswordErrors({
                      current_password: "",
                      password: "",
                      password_confirmation: ""
                    });
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary disabled:opacity-60"
                  disabled={changing || !canChangePassword}
                >
                  {changing ? "Actualizando…" : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </ResponsivePane>
    </AppLayout>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider placement="top-right">
      <ProfilePageInner />
    </ToastProvider>
  );
}
