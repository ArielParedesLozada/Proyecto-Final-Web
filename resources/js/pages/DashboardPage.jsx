import AppLayout from "../layouts/AppLayout";
import StatPro from "../components/ui/StatPro";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";
import Empty from "../components/ui/Empty";
import ScrollArea from "../components/ui/ScrollArea";

export default function DashboardPage() {
  const totalAhorrado = 15750, metaMensual = 2000, metasActivas = 3, progresoMensual = 63;

  const activas = [
    { name: "1", current: 3200, target: 5000 },
    { name: "2", current: 3200, target: 5000 },
    { name: "V3", current: 3200, target: 5000 },
    { name: "4", current: 3200, target: 5000 },
    { name: "5", current: 3200, target: 5000 },
    { name: "6", current: 3200, target: 5000 },
    { name: "7", current: 3200, target: 5000 },
    { name: "8", current: 3200, target: 5000 },
    { name: "9", current: 3200, target: 5000 },
    { name: "10", current: 3200, target: 5000 },
    { name: "11", current: 3200, target: 5000 },
    { name: "Vacaciones de Verano", current: 3200, target: 5000 },
    // añade más para probar el scroll...
  ];

  const completadas = [
    { id: 1, title: "1”", when: "Hace 2 horas" },
    { id: 2, title: "2op” completada", when: "Ayer" },
    { id: 1, title: "3a “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "4 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "5 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "6 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "7 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "8 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "9 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "10 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "11 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "12 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "13 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "14 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "15 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "16 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "17 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "18 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "19 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "20 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "21 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "22 “Nuevo Laptop” completada", when: "Ayer" },
    { id: 1, title: "23 “Vacaciones”", when: "Hace 2 horas" },
    { id: 2, title: "24 “Nuevo Laptop” completada", when: "Ayer" },
    // añade más para probar el scroll...
  ];

  // 👇 helper para limitar altura SOLO en móvil cuando hay más de 6 ítems
  const capMobileClass = (shouldCap) =>
    shouldCap ? " max-h-[60vh] overflow-y-auto scroll-invisible xl:max-h-none" : "";

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
      {/* === WRAPPER ===
          En móvil: grid simple (sin forzar alto).
          En XL: reparte el alto entre KPIs y contenido. */}
      <div className="grid gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
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

        {/* Grid principal
            En móvil: flujo natural.
            En XL: estira y reparte el alto entre columnas. */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:min-h-0 xl:items-stretch">
          {/* Columna izquierda */}
          <div className="min-h-0 xl:col-span-2 xl:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Metas de Ahorro Activas</h2>
              <ScrollArea
                className={
                  "space-y-3" +
                  capMobileClass(activas.length > 6) // 👈 límite y scroll interno solo en móvil si > 6
                }
              >
                {activas.length
                  ? activas.map((g, idx) => <GoalItem key={`${g.name}-${idx}`} {...g} />)
                  : <Empty title="Sin metas activas" subtitle="Crea tu primera meta para empezar." />
                }
              </ScrollArea>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="min-h-0 xl:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Metas Completadas</h2>
              <ScrollArea
                className={
                  capMobileClass(completadas.length > 6) // 👈 igual comportamiento en móvil
                }
              >
                {completadas.length
                  ? <CompletedList items={completadas} />
                  : <Empty title="Nada completado aún" subtitle="Aquí verás tus logros recientes." />
                }
              </ScrollArea>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}