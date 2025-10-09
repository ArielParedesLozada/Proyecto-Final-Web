import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import { ToastProvider, useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/profile";
import PasswordInput from "../components/login/PasswordInput";
import useCache from "../hooks/useCache";

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

function ProfilePageInner() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { updateUser } = useAuth();
  const { fetchWithCache, invalidateCache } = useCache();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchWithCache('user-profile', () => getProfile());
        if (p) {
          setFirstName(p.first_name || "");
          setLastName(p.last_name || "");
          setEmail(p.email || "");
          
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
  }, []);

  const initials = useMemo(() => {
    const a = (firstName || "").trim()[0] || "";
    const b = (lastName || "").trim()[0] || "";
    return (a + b).toUpperCase() || "U";
  }, [firstName, lastName]);

  const hasAccountChanges = useMemo(() => {
    return (
      firstName.trim() !== originalFirstName ||
      lastName.trim() !== originalLastName ||
      email.trim() !== originalEmail
    );
  }, [firstName, lastName, email, originalFirstName, originalLastName, originalEmail]);

  const canChangePassword = useMemo(() => {
    if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
      return false;
    }
    
    if (newPwd !== confirmPwd) {
      return false;
    }
    
    if (currentPwd === newPwd) {
      return false;
    }
    
    if (newPwd.length < 8) {
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPwd)) {
      return false;
    }
    
    return true;
  }, [currentPwd, newPwd, confirmPwd]);

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

      setOriginalFirstName(nextFirst);
      setOriginalLastName(nextLast);
      setOriginalEmail(nextEmail);
      invalidateCache('user-profile');

      toast.push({ tone: "success", title: "Cambios guardados" });
    } catch (err) {
      console.error("Profile save error:", err);
      
      let errorMessage = "No se pudo guardar.";
      
      if (err.response?.data?.errors) {
        const errorMessages = [];
        for (const field in err.response.data.errors) {
          errorMessages.push(err.response.data.errors[field].join(", "));
        }
        errorMessage = errorMessages.join("; ");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.push({ tone: "error", title: "Error al guardar", message: errorMessage });
    } finally {
      setSaving(false);
    }
  }

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
      
      if (err.message && err.message.includes(";")) {
        const errorMessages = err.message.split("; ");
        toast.push({ tone: "error", title: "Error de validación", message: errorMessages[0] });
      } else if (err.message && (
        err.message.includes("contraseña debe") || 
        err.message.includes("contraseña actual") ||
        err.message.includes("coinciden") ||
        err.message.includes("mínimo 8 caracteres") ||
        err.message.includes("incorrecta")
      )) {
        toast.push({ tone: "error", title: "Error de validación", message: err.message });
      } else {
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

          <main className="xl:col-span-2 space-y-5">
            <form onSubmit={handleSaveAccount} className="fin-card p-5 md:p-6">
              <SectionHeader
                title="Datos de la cuenta"
                subtitle="Información básica para identificar tu perfil."
                right={
                  <button
                    type="submit"
                    className="btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="btn btn-ghost cursor-pointer"
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
                  className="btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
