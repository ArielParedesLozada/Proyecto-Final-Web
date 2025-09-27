import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import UserAvatar from "../components/ui/UserAvatar";
import { useAuth } from "../contexts/AuthContext";

const NavItem = ({ to, icon, label, active, collapsed }) => {
  const base =
    "w-full rounded-lg text-sm transition select-none " +
    (active
      ? "bg-primary-600/10 text-primary-600 dark:text-primary-200"
      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50");

  const layout = collapsed
    ? "flex items-center justify-center px-0 py-2"
    : "flex items-center gap-3 px-3 py-2.5";

  return (
    <Link to={to} className={`${base} ${layout}`} title={collapsed ? label : undefined}>
      <span className="shrink-0 grid place-items-center" style={{ width: 22, height: 22 }}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

export default function AppLayout({ children, header }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("fs_sidebar_collapsed") === "true"
  );
  useEffect(() => localStorage.setItem("fs_sidebar_collapsed", String(collapsed)), [collapsed]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" className="fill-current/80" /></svg> },
      { to: "/goals", label: "Metas de Ahorro", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 3l8 4-8 4-8-4 8-4Zm0 6v12M5 9v10m16-10v10" className="stroke-current/80" strokeWidth="1.6" strokeLinecap="round" /></svg> },
      { to: "/transactions", label: "Ingresos y Gastos", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h7" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round" /></svg> },
      { to: "/statistics", label: "Estadisticas", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V4m0 16h16M7 16V9m5 7V6m5 10v-4" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round" /></svg> },
      { to: "/history", label: "Historial", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 2M3 12a9 9 0 1 0 3-6" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round" /></svg> },
      { to: "/profile", label: "Perfil", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 3-9 6v1h18v-1c0-3-4-6-9-6Z" className="fill-current/80" /></svg> },
    ],
    []
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const SidebarContent = (
    <div className="fin-card h-full p-4 flex flex-col">
      <nav className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1">
        {items.map((it) => (
          <NavItem key={it.to} {...it} collapsed={collapsed} active={pathname.startsWith(it.to)} />
        ))}
      </nav>

      <div className="mt-2">
        <button
          type="button"
          onClick={handleLogout}
          className={[
            "w-full rounded-lg text-sm transition select-none cursor-pointer",
            "text-red-500/90 hover:text-red-400 hover:bg-red-500/10",
            collapsed
              ? "flex items-center justify-center px-0 py-2"
              : "flex items-center gap-3 px-3 py-2.5",
          ].join(" ")}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <span className="shrink-0 grid place-items-center" style={{ width: 22, height: 22 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v8" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7 4.8A8 8 0 1 0 17 4.8" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>

      <div
        className={[
          "mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/50 text-xs text-gray-500",
          collapsed ? "text-center" : "",
        ].join(" ")}
      >
        © {new Date().getFullYear()} FinSave
      </div>
    </div>
  );

  const displayName = useMemo(() => {
    const fn = (user?.first_name || '').trim();
    const ln = (user?.last_name || '').trim();
    const full = (user?.full_name || '').trim();
    return full || [fn, ln].filter(Boolean).join(' ').trim() || fn || "Usuario";
  }, [user?.first_name, user?.last_name, user?.full_name]);

  const initials = useMemo(() => {
    const fn = (user?.first_name || '').trim();
    const ln = (user?.last_name || '').trim();
    if (fn || ln) return `${fn[0] || ''}${ln[0] || ''}`.toUpperCase() || "U";
    const parts = (user?.full_name || '').trim().split(/\s+/);
    return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() || "U";
  }, [user?.first_name, user?.last_name, user?.full_name]);

  return (
    <div className="flex h-auto xl:h-[100dvh]">

      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex sticky top-0 h-screen flex-col transition-[width] duration-300",
          collapsed ? "w-20 px-2" : "w-64 px-4",
          "py-4",
        ].join(" ")}
        aria-label="Sidebar de navegación"
        aria-expanded={!collapsed}
      >
        {/* Header del menú (logo + flecha) */}
        <div
          className={[
            "mb-3 flex items-center",
            collapsed ? "justify-center gap-2" : "justify-between gap-3",
          ].join(" ")}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
            <img
              src="/assets/icons/Logo_FinSave.png"
              alt="FinSave Logo"
              className="h-8 w-8 object-contain"
            />
            {!collapsed && <p className="text-sm font-semibold">Gestión de Ahorros</p>}
          </div>

          <button
            className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 min-h-0">{SidebarContent}</div>
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-40 ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-full w-64 p-4 transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary-600 text-white font-semibold">FS</div>
              <p className="text-sm font-semibold">Gestión de Ahorros</p>
            </div>
            <button
              className="h-8 w-8 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="h-[calc(100%-3rem)] min-h-0">{SidebarContent}</div>
        </aside>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0 overflow-visible xl:overflow-hidden">

        {/* Contenedor central que reparte la altura entre header y contenido */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="mx-auto max-w-screen-2xl h-full px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col min-h-0 overflow-hidden">
            {/* Header por página */}
            <header className="mb-4 md:mb-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  className="md:hidden h-9 w-9 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menú"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h16M4 17h16" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                {header ?? null}
              </div>

              {/* Avatar que reacciona al instante */}
              <UserAvatar name={displayName} initials={initials} />
            </header>

            {/* Contenido de la página: ocupa el resto */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
