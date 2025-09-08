import AppLayout from "../layouts/AppLayout";
import { Stat } from "../components/ui/Stat";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";

export default function DashboardPage() {
  // Demo data (reemplázalo con tus servicios cuando tengas backend)
  const totalAhorrado = 15750;
  const metaMensual = 2000;
  const metasActivas = 3;
  const progresoMensual = 63;

  const activas = [
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    { name: "Fondo de Emergencia", current: 7500, target: 10000 },
  ];

  const completadas = [
    { id: 1, title: "Meta “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "Meta “Nuevo Laptop” completada", when: "Ayer" },
    { id: 3, title: "Meta “Nuevo carro” completada", when: "Hace 3 días" },
  ];

  return (
    <AppLayout>
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          title="Total Ahorrado"
          value={`$${totalAhorrado.toLocaleString()}`}
          helper="+12% desde el mes pasado"
          icon={<span className="text-sm opacity-70">$</span>}
        />
        <Stat
          title="Meta Mensual"
          value={`$${metaMensual.toLocaleString()}`}
          helper="$1250 este mes"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 6h18M3 18h18"
                className="stroke-current/70" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
        <Stat
          title="Metas Activas"
          value={metasActivas}
          helper="2 completadas"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l6 6L21 6" className="stroke-current/70" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
        />
        <Stat
          title="Progreso Mensual"
          value={`${progresoMensual}%`}
          helper={
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-gray-700/60 overflow-hidden">
                <div className="h-full bg-primary-600" style={{ width: `${progresoMensual}%` }} />
              </div>
            </div>
          }
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V4h16v8H8l-4 4Z"
                className="stroke-current/70" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          }
        />
      </section>

      {/* Listas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="fin-card p-4 md:p-5">
          <h2 className="text-sm font-semibold mb-3">Metas de Ahorro Activas</h2>
          <div className="space-y-3">
            {activas.map((g) => (
              <GoalItem key={g.name} {...g} />
            ))}
          </div>
        </div>

        <div className="fin-card p-4 md:p-5">
          <h2 className="text-sm font-semibold mb-3">Metas Completadas</h2>
          <CompletedList items={completadas} />
        </div>
      </section>
    </AppLayout>
  );
}
