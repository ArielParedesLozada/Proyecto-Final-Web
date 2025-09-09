import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Switch from "../components/ui/Switch";

function AvatarReadOnly({ nameFull = "ElkinnnLopez_10", initials = "EL" }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-primary-600 text-white grid place-items-center text-xl font-semibold ring-1 ring-white/10 shadow">
        {initials}
      </div>
      <div>
        <p className="font-semibold leading-tight">{nameFull}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Avatar del usuario (no editable)</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  // Datos de la cuenta (ejemplo local; conecta con tu API cuando quieras)
  const [firstName, setFirstName] = useState("Elkinnn");
  const [lastName, setLastName]   = useState("Lopez_10");
  const [email, setEmail]         = useState("usuario@correo.com");

  // Cambio de contraseña
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // Preferencias: solo modo oscuro
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("fs_darkmode");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("fs_darkmode", String(darkMode));
  }, [darkMode]);

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Perfil</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Administra tu información de cuenta y preferencias
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
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  return (
    <AppLayout header={header}>
      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Columna izquierda: Identidad + Preferencias */}
        <div className="space-y-4 xl:col-span-1">
          {/* Identidad */}
          <section className="fin-card p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Identidad</h3>
            </div>
            <div className="mt-4">
              <AvatarReadOnly nameFull={`${firstName} ${lastName}`} initials="EL" />
            </div>
          </section>

          {/* Preferencias */}
          <section className="fin-card p-5 md:p-6">
            <h3 className="text-base font-semibold">Preferencias</h3>
            <div className="mt-3 space-y-3">
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                label="Modo oscuro"
                hint="Usar tema oscuro por defecto"
              />
            </div>
          </section>
        </div>

        {/* Columna derecha: Datos de cuenta + Contraseña */}
        <div className="space-y-4 xl:col-span-2">
          {/* Datos de la cuenta */}
          <form onSubmit={handleSaveAccount} className="fin-card p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Datos de la cuenta</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-1">Nombre</span>
                <input
                  className="input-base"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">Apellido</span>
                <input
                  className="input-base"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm mb-1">Correo</span>
                <input
                  className="input-base"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                />
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button className="btn btn-primary">Guardar cambios</button>
            </div>
          </form>

          {/* Cambiar contraseña */}
          <form onSubmit={handleChangePassword} className="fin-card p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Cambiar contraseña</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-sm mb-1">Actual</span>
                <input
                  className="input-base"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">Nueva</span>
                <input
                  className="input-base"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-1">Confirmar</span>
                <input
                  className="input-base"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
                }}
              >
                Limpiar
              </button>
              <button type="submit" className="btn btn-primary">
                Actualizar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
