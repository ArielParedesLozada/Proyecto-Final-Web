import AppLayout from "../layouts/AppLayout";
import StatsFilters from "../components/statistics/StatsFilters";
import StatsCards from "../components/statistics/StatsCards";

export default function StatisticsPage() {
  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Estadísticas</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Visualiza y compara tu ahorro</p>
    </div>
  );

  return (
    <AppLayout header={header}>
      <StatsFilters onApply={() => { /* luego conectamos filtros reales */ }} />
      <StatsCards donutPct={40} />
    </AppLayout>
  );
}
