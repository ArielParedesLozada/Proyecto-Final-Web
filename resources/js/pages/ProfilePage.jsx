import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import { ToastProvider, useToast } from "../components/ui/ToastProvider";
import { useAuth } from "../contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "../services/profile";
import PasswordInput from "../components/login/PasswordInput";

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
      <div>
        <p className="font-semibold leading-tight">{nameFull}</p>
        <p className="text-sm text-gray-500">Avatar del usuario (no editable)</p>
      </div>
    </div>
  );
}

/* --- Página (inner) --- */
function ProfilePageInner() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  // Estado datos de la cuenta
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Cambio de contraseña
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // Flags
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cargar perfil
  useEffect(() => {
    (async () => {
      try {
        const p = await getProfile();
        setFirstName(p.first_name || "");
        setLastName(p.last_name || "");
        setEmail(p.email || "");
        setUser?.((prev) => ({
          ...(prev || {}),
          ...p,
          full_name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
        }));
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
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      setUser?.((prev) => ({
        ...(prev || {}),
        ...updated,
        full_name: `${updated.first_name ?? ""} ${updated.last_name ?? ""}`.trim(),
      }));
      toast.push({ tone: "success", title: "Cambios guardados" });
    } catch (err) {
      const msg = err?.response?.data?.message || "No se pudo guardar.";
      toast.push({ tone: "error", title: "Error al guardar", message: msg });
    } finally {
      setSaving(false);
    }
  }

  // Cambiar contraseña
  async function handleChangePassword(e) {
    e.preventDefault();
    if (!newPwd || newPwd !== confirmPwd) {
      toast.push({ tone: "warning", title: "Las contraseñas no coinciden" });
      return;
    }
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
      const msg =
        err?.response?.data?.message || "No se pudo actualizar la contraseña.";
      toast.push({ tone: "error", title: "Error", message: msg });
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
                    disabled={saving}
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
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary disabled:opacity-60"
                  disabled={changing}
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
