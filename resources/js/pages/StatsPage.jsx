import AppLayout from "../layouts/AppLayout";
import Card from "../components/common/Card";
import ChartPlaceholder from "../components/stats/ChartPlaceholder";
import StatsFilters from "../components/stats/StatsFilters";

export default function StatsPage() {
  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Estadísticas</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Visualiza el progreso de tus metas y tus hábitos de ahorro
      </p>
    </div>
  );

  const applyFilters = () => {
    // aquí luego disparas la carga real (fetch + setState)
    console.log("Aplicar filtros…");
  };

  return (
    <AppLayout header={header}>
      {/* Filtros superiores */}
      <Card className="mb-4">
        <StatsFilters onApply={applyFilters} />
      </Card>

      {/* Grid principal de tarjetas (placeholder de charts) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Estado de las Metas"
          subtitle="Distribución del estado actual de todas tus metas"
          actions={<span className="text-xs text-gray-500 dark:text-gray-400">Últimos 12 meses</span>}
        >
          <ChartPlaceholder variant="bar" height={240} />
        </Card>

        <Card
          title="Progreso Mensual"
          subtitle="Comparación entre ahorro real y sugerido por mes"
        >
          <ChartPlaceholder variant="line" height={240} />
        </Card>

        <Card
          title="Ahorro por Categoría"
          subtitle="Progreso actual vs meta objetivo por categoría"
        >
          <ChartPlaceholder variant="bar" height={240} />
        </Card>

        <Card
          title="Evolución del Ahorro Total"
          subtitle="Crecimiento acumulado a lo largo del tiempo"
        >
          <ChartPlaceholder variant="line" height={240} />
        </Card>

        {/* Tarjeta “wide” para KPIs/resumen */}
        <Card
          title="Resumen de Indicadores"
          subtitle="KPI claves de desempeño"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Ahorro total", "Metas cumplidas", "Días consistentes", "Ticket promedio"].map((k) => (
              <div
                key={k}
                className="rounded-xl ring-1 ring-gray-200/70 dark:ring-gray-700/50 bg-white/70 dark:bg-gray-800/40 p-4"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{k}</p>
                <div className="mt-2 h-8 w-24 rounded-md bg-gray-200/70 dark:bg-gray-700/60 animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
