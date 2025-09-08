import AppLayout from "../layouts/AppLayout";
import StatPro from "../components/ui/StatPro";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";

export default function DashboardPage() {
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
      {/* KPIs con sparkline y delta */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr">
        <div className="h-full">
          <StatPro
            title="Total Ahorrado"
            value={`$${totalAhorrado.toLocaleString()}`}
            delta="+12%" deltaLabel="desde el mes pasado" positive
            spark={[45, 48, 52, 60, 62, 67, 72, 74, 78]}
            icon={<span className="text-sm opacity-70">$</span>}
          />
        </div>

        <div className="h-full">
          <StatPro
            title="Meta Mensual"
            value={`$${metaMensual.toLocaleString()}`}
            delta="+$250" deltaLabel="vs. promedio" positive
            spark={[20, 24, 26, 28, 30, 35, 38, 40, 42]}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" className="stroke-current/70" strokeWidth="1.6" strokeLinecap="round"/></svg>}
          />
        </div>

        <div className="h-full">
          <StatPro
            title="Metas Activas"
            value={metasActivas}
            delta="2" deltaLabel="completadas" positive
            spark={[30,35,40,38,42,45,48,50,55]}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12l6 6L21 6" className="stroke-current/70" strokeWidth="2" strokeLinecap="round"/></svg>}
          />
        </div>

        <div className="h-full">
          <StatPro
            title="Progreso Mensual"
            value={`${progresoMensual}%`}
            delta="+5%" deltaLabel="vs. mes anterior" positive
            spark={[40,45,47,50,55,58,60,62,63]}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20V4h16v8H8l-4 4Z" className="stroke-current/70" strokeWidth="1.6" strokeLinecap="round"/></svg>}
          />
        </div>
      </section>

      {/* Dos paneles principales */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="fin-card card-hover p-4 md:p-5">
          <h2 className="text-sm font-semibold mb-3">Metas de Ahorro Activas</h2>
          <div className="space-y-3">
            {activas.map((g) => <GoalItem key={g.name} {...g} />)}
          </div>
        </div>

        <div className="fin-card card-hover p-4 md:p-5">
          <h2 className="text-sm font-semibold mb-3">Metas Completadas</h2>
          <CompletedList items={completadas} />
        </div>
      </section>
    </AppLayout>
  );
}
