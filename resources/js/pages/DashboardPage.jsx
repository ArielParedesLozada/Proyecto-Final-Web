import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import StatPro from "../components/ui/StatPro";
import GoalItem from "../components/dashboard/GoalItem";
import CompletedList from "../components/dashboard/CompletedList";
import Empty from "../components/ui/Empty";
import ScrollArea from "../components/ui/ScrollArea";

// servicios
import { listGoals } from "../services/goals";
import {
  getMonthlyIncomeExpense,
  getMonthlyRealVsSuggested,
  getGoalsStatusDistribution,
} from "../services/stats";
import { goalApiToUi } from "../services/adapters";

// Helpers de fechas
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Íconos inline */
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
  const [loading, setLoading] = useState(true);

  // KPIs
  const [totalAhorrado, setTotalAhorrado] = useState(0);
  const [metaMensualSugerida, setMetaMensualSugerida] = useState(0);
  const [metasActivas, setMetasActivas] = useState(0);
  const [progresoMensual, setProgresoMensual] = useState(0);

  // Listas
  const [goalsActive, setGoalsActive] = useState([]);
  const [goalsCompleted, setGoalsCompleted] = useState([]);

  async function load() {
    setLoading(true);
    try {
      // Últimos 12 meses para "Total Ahorrado"
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 11);
      const params12m = {
        start: ymd(new Date(start.getFullYear(), start.getMonth(), 1)),
        end: ymd(end),
      };

      // 1) Total Ahorrado (ingresos - gastos)
      const inex = await getMonthlyIncomeExpense(params12m);
      const total = (inex.data ?? []).reduce(
        (acc, m) => acc + (Number(m.incomes || 0) - Number(m.expenses || 0)),
        0
      );
      setTotalAhorrado(Math.max(0, Math.round(total)));

      // 2) Meta mensual sugerida y progreso del mes
      const rvs = await getMonthlyRealVsSuggested({});
      const serie = rvs.data ?? [];
      const ultimo = serie[serie.length - 1] || { real: 0, suggested: 0 };
      const sug = Number(ultimo.suggested || 0);
      const real = Number.isFinite(ultimo.real) ? Number(ultimo.real) : 0;
      setMetaMensualSugerida(Math.round(sug));
      setProgresoMensual(sug > 0 ? Math.round((real / sug) * 100) : 0);

      // 3) Metas activas
      const dist = await getGoalsStatusDistribution({});
      const actRow = (dist.data || []).find((x) => x.status === "Activa");
      setMetasActivas(Number(actRow?.value || 0));

      // 4) Listas (activas / completadas)
      const resGoals = await listGoals({ page: 1, pageSize: 100, filters: {} });
      const rows = (resGoals.data ?? []).map(goalApiToUi);

      const actives = rows
        .filter((g) => g.status === "Activa")
        .map((g) => ({
          id: g.id,
          name: g.name,
          current: Number(g.currentAmount || 0),
          target: Number(g.targetAmount || 0),
          updatedAt: g.updatedAt || g.createdAt,
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      const completed = rows
        .filter((g) => g.status === "Completada")
        .map((g) => ({
          id: g.id,
          name: g.name,
          finishedAt: g.finishedAt || "",
          deadline: g.deadline || "",
          updatedAt: g.updatedAt || g.createdAt,
        }))
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .slice(0, 20);

      setGoalsActive(actives);
      setGoalsCompleted(completed);
    } finally {
      setLoading(false);
    }
  }

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

        {/* Grid principal */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:min-h-0 xl:items-stretch">
          {/* IZQ: metas activas */}
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
                  <Empty title="Sin metas activas" subtitle="Crea tu primera meta para empezar." />
                )}
              </ScrollArea>
            </div>
          </div>

          {/* DER: completadas */}
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
                  <Empty title="Nada completado aún" subtitle="Aquí verás tus logros recientes." />
                )}
              </ScrollArea>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
