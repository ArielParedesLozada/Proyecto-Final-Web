import AppLayout from "../layouts/AppLayout";
import StatPro from "../components/ui/StatPro";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";
import Empty from "../components/ui/Empty";
import ScrollArea from "../components/ui/ScrollArea";

export default function DashboardPage() {
  const totalAhorrado = 15750, metaMensual = 2000, metasActivas = 3, progresoMensual = 63;

  const activas = [
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    // añade más para probar el scroll...
  ];

  const completadas = [
    { id: 1, title: "Meta “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "Meta “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "Meta “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "Meta “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "Meta “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "Meta “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "Meta “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "Meta “Nuevo Laptop” completada", when: "Ayer" },
    // añade más para probar el scroll...
  ];

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Resumen de tus metas de ahorro y progreso financiero
      </p>
    </div>
  );

  return (
    <AppLayout header={header}>
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr">
        <div className="h-full">
          <StatPro
            title="Total Ahorrado"
            value={`$${totalAhorrado.toLocaleString()}`}
            delta="+12%"
            deltaLabel="vs. mes pasado"
            positive
            spark={[45, 48, 52, 60, 62, 67, 72, 74, 78]}
            icon={<span className="opacity-70">$</span>}
          />
        </div>
        <div className="h-full">
          <StatPro
            title="Meta Mensual"
            value={`$${metaMensual.toLocaleString()}`}
            delta="+$250"
            deltaLabel="vs. promedio"
            positive
            spark={[20, 24, 26, 28, 30, 35, 38, 40, 42]}
          />
        </div>
        <div className="h-full">
          <StatPro
            title="Metas Activas"
            value={metasActivas}
            delta="2"
            deltaLabel="completadas"
            positive
            spark={[30, 35, 40, 38, 42, 45, 48, 50, 55]}
          />
        </div>
        <div className="h-full">
          <StatPro
            title="Progreso Mensual"
            value={`${progresoMensual}%`}
            delta="+5%"
            deltaLabel="vs. mes anterior"
            positive
            spark={[40, 45, 47, 50, 55, 58, 60, 62, 63]}
          />
        </div>
      </section>

      {/* Grid principal 2 columnas (2/1) */}
      {/* NOTA: sin auto-rows-fr para que no fuerce la misma altura */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        {/* Columna izquierda: metas activas (altura independiente) */}
        <div className="xl:col-span-2 min-h-0 self-start">
          <div
            className="
              fin-card card-hover p-4 md:p-5 flex flex-col
              /* límite de crecimiento; ajusta si deseas */
              max-h-[48vh] md:max-h-[52vh] xl:max-h-[56vh]
            "
          >
            <h2 className="text-sm font-semibold mb-3">Metas de Ahorro Activas</h2>

            {/* Área que scrollea cuando hay muchas metas */}
            <ScrollArea className="space-y-3">
              {activas.length
                ? activas.map((g, idx) => <GoalItem key={`${g.name}-${idx}`} {...g} />)
                : <Empty title="Sin metas activas" subtitle="Crea tu primera meta para empezar." />
              }
            </ScrollArea>
          </div>
        </div>

        {/* Columna derecha: metas completadas (llena y scrollea adentro) */}
        <div className="min-h-0">
          <div
            className="
              fin-card card-hover p-4 md:p-5 h-full flex flex-col
              max-h-[48vh] md:max-h-[52vh] xl:max-h-[56vh]
            "
          >
            <h2 className="text-sm font-semibold mb-3">Metas Completadas</h2>

            {/* Área que scrollea cuando hay muchas completadas */}
            <ScrollArea>
              {completadas.length
                ? <CompletedList items={completadas} />
                : <Empty title="Nada completado aún" subtitle="Aquí verás tus logros recientes." />
              }
            </ScrollArea>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
