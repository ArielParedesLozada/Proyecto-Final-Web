import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import StatPro from "../components/ui/StatPro";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";
import Empty from "../components/ui/Empty";
import ScrollArea from "../components/ui/ScrollArea";

// servicios
import { getDashboardSummary } from "../services/stats";
import useCache from "../hooks/useCache";

// Helpers de fechas
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const MoneyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 9h1.5M15.5 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
    <rect x="4" y="16" width="10" height="2" rx="1" fill="currentColor" />
  </svg>
);
const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 17l6-6 4 4 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 7h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DashboardPage() {
  const { fetchWithCache, invalidateCache } = useCache();
  const [loading, setLoading] = useState(true);

  const [totalAhorrado, setTotalAhorrado] = useState(0);
  const [metaMensualSugerida, setMetaMensualSugerida] = useState(0);
  const [metasActivas, setMetasActivas] = useState(0);
  const [progresoMensual, setProgresoMensual] = useState(0);


  const [goalsActive, setGoalsActive] = useState([]);
  const [goalsCompleted, setGoalsCompleted] = useState([]);

  async function load(forceRefresh = false) {
    setLoading(true);
    try {
      const response = await fetchWithCache(
        'dashboard-summary',
        () => getDashboardSummary(),
        { forceRefresh }
      );
      
      if (response) {
        const data = response.data;

        setTotalAhorrado(data.totalAhorrado);
        setMetaMensualSugerida(data.metaMensualSugerida);
        setProgresoMensual(data.progresoMensual);
        setMetasActivas(data.metasActivas);
        setGoalsActive(data.goalsActive);
        setGoalsCompleted(data.goalsCompleted);
      }
    } finally {
      setLoading(false);
    }
  }

  const refreshData = () => {
    invalidateCache('dashboard-summary');
    load(true);
  };

  useEffect(() => {
    invalidateCache('dashboard-summary');
  }, []);

  useEffect(() => {
    load();
  }, []);

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
      <div className="grid gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-fr">
          <div className="h-full">
            <StatPro
              title="Total Ahorrado"
              value={`$${Number(totalAhorrado).toLocaleString()}`}
              sublabel="Últimos 12 meses"
              icon={<MoneyIcon />}
              variant="emerald"
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Meta Mensual Sugerida"
              value={`$${Number(metaMensualSugerida).toLocaleString()}`}
              sublabel="Estimación por metas activas"
              icon={<TargetIcon />}
              variant="violet"
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Metas Activas"
              value={metasActivas}
              sublabel="Actualmente en curso"
              icon={<ListIcon />}
              variant="indigo"
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Progreso Mensual"
              value={`${Number(progresoMensual)}%`}
              sublabel="Real vs sugerido"
              icon={<TrendingIcon />}
              variant="amber"
              loading={loading}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:min-h-0 xl:items-stretch">
          <div className="min-h-0 xl:col-span-2 xl:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Metas de Ahorro Activas</h2>
              <ScrollArea className="space-y-3">
                {loading ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Cargando…</div>
                ) : goalsActive.length ? (
                  goalsActive.map((g) => (
                    <GoalItem key={g.id} name={g.name} current={g.current} target={g.target} />
                  ))
                ) : (
                  <Empty 
                    variant="goals"
                    title="Sin metas activas" 
                    subtitle="Crea tu primera meta para empezar tu viaje hacia el ahorro."
                    description="Las metas te ayudan a organizar tus finanzas y alcanzar tus objetivos financieros de manera estructurada."
                  />
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="min-h-0 xl:h-full">
            <div className="fin-card card-hover p-4 md:p-5 h-full flex flex-col">
              <h2 className="text-sm font-semibold mb-3">Metas Completadas</h2>
              <ScrollArea>
                {loading ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Cargando…</div>
                ) : goalsCompleted.length ? (
                  <CompletedList
                    items={goalsCompleted.map((g) => ({
                      id: g.id,
                      name: g.name,
                      finishedAt: g.finishedAt,
                      deadline: g.deadline,
                    }))}
                  />
                ) : (
                  <Empty 
                    variant="completed"
                    title="Nada completado aún" 
                    subtitle="Aquí verás tus logros recientes cuando completes tus metas."
                    description="Cada meta completada representa un paso importante hacia tus objetivos financieros."
                  />
                )}
              </ScrollArea>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
