import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane"; // 👈 NUEVO

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

function AvatarReadOnly({ nameFull = "Elkinnn Lopez_10", initials = "EL" }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-primary-600 text-white grid place-items-center text-xl font-semibold ring-1 ring-black/5 shadow">
        {initials}
      </div>
      <div>
        <p className="font-semibold leading-tight">{nameFull}</p>
        <p className="text-sm text-gray-500">Avatar del usuario (no editable)</p>
      </div>
    </div>
  );
}

/* --- Página --- */
export default function ProfilePage() {
  // Datos de la cuenta (ejemplo local; conecta con tu API cuando quieras)
  const [firstName, setFirstName] = useState("Elkinnn");
  const [lastName, setLastName] = useState("Lopez_10");
  const [email, setEmail] = useState("usuario@correo.com");

  // Cambio de contraseña
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Perfil</h1>
      <p className="text-sm text-gray-500">
        Administra tu información de cuenta y seguridad
      </p>
    </div>
  );

  const handleSaveAccount = (e) => {
    e.preventDefault();
    // TODO: integrar con API
    alert("Datos de cuenta guardados (demo)");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPwd || newPwd !== confirmPwd) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    // TODO: integrar con API
    alert("Contraseña actualizada (demo)");
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  return (
    <AppLayout header={header}>
      {/* Igual que en Goals: en móvil fluye; en XL, scroll interno invisible */}
      <ResponsivePane toolbar={null}>
        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Columna izquierda: Identidad */}
          <aside className="xl:col-span-1">
            <section className="fin-card p-5 md:p-6">
              <SectionHeader title="Identidad" />
              <div className="mt-4">
                <AvatarReadOnly nameFull={`${firstName} ${lastName}`} initials="EL" />
              </div>
            </section>
          </aside>

          {/* Columna derecha: Contenido principal */}
          <main className="xl:col-span-2 space-y-5">
            {/* Datos de la cuenta */}
            <form onSubmit={handleSaveAccount} className="fin-card p-5 md:p-6">
              <SectionHeader
                title="Datos de la cuenta"
                subtitle="Información básica para identificar tu perfil."
                right={
                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
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
                    readOnly
                  />
                </Field>
              </div>
            </form>

            {/* Seguridad / Cambiar contraseña */}
            <form onSubmit={handleChangePassword} className="fin-card p-5 md:p-6">
              <SectionHeader
                title="Seguridad"
                subtitle="Actualiza tu contraseña periódicamente."
              />

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field id="pwd-current" label="Actual">
                  <input
                    id="pwd-current"
                    className="input-base"
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>

                <Field id="pwd-new" label="Nueva" hint="Mínimo 8 caracteres.">
                  <input
                    id="pwd-new"
                    className="input-base"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>

                <Field id="pwd-confirm" label="Confirmar">
                  <input
                    id="pwd-confirm"
                    className="input-base"
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
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
                <button type="submit" className="btn btn-primary">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </main>
        </div>
      </ResponsivePane>
    </AppLayout>
  );
}
