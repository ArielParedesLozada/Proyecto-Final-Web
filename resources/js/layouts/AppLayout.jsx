import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={[
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
      active
        ? "bg-primary-600/10 text-primary-600 dark:text-primary-200"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50",
    ].join(" ")}
  >
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </Link>
);

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const items = useMemo(
    () => [
      // ... tus items (igual que ya los tienes)
      { to: "/dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" className="fill-current/80"/></svg> },
      { to: "/goals", label: "Metas de Ahorro", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 3l8 4-8 4-8-4 8-4Zm0 6v12M5 9v10m16-10v10" className="stroke-current/80" strokeWidth="1.6" strokeLinecap="round"/></svg> },
      { to: "/transactions", label: "Ingresos y Gastos", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h7" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round"/></svg> },
      { to: "/analytics", label: "Visualización", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20V4m0 16h16M7 16V9m5 7V6m5 10v-4" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round"/></svg> },
      { to: "/history", label: "Historial", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 2M3 12a9 9 0 1 0 3-6" className="stroke-current/80" strokeWidth="1.8" strokeLinecap="round"/></svg> },
      { to: "/profile", label: "Perfil", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 3-9 6v1h18v-1c0-3-4-6-9-6Z" className="fill-current/80"/></svg> },
    ],
    []
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar sticky full-height */}
      <aside className="hidden md:block w-64 sticky top-0 h-screen p-4">
        <div className="fin-card h-full p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary-600 text-white font-semibold">FS</div>
            <p className="text-sm font-semibold">Gestión de Ahorros</p>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
            {items.map((it) => (
              <NavItem key={it.to} {...it} active={pathname.startsWith(it.to)} />
            ))}
          </nav>

          {/* Footer del sidebar opcional */}
          <div className="pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-700/50 text-xs text-gray-500">
            © {new Date().getFullYear()} FinSave
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="mx-auto max-w-screen-2xl p-4 md:p-8">
          <header className="mb-4 md:mb-6">
            <h1 className="text-lg md:text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Resumen de tus metas de ahorro y progreso financiero
            </p>
          </header>
          {children}
          {/* Spacing final pequeño para evitar “hoyo” visual pegado al borde */}
          <div className="h-6" />
        </div>
      </main>
    </div>
  );
}
