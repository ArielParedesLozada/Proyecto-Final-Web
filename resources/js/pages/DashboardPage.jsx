import React, { useEffect, useMemo, useState } from "react";
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
      // === Rango para "total ahorrado": últimos 12 meses ===
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 11); // 12 meses contando el actual
      const params12m = { start: ymd(new Date(start.getFullYear(), start.getMonth(), 1)), end: ymd(end) };

      // 1) Ingresos vs Gastos (para total ahorrado)
      const inex = await getMonthlyIncomeExpense(params12m);
      const total = (inex.data ?? []).reduce(
        (acc, m) => acc + (Number(m.incomes || 0) - Number(m.expenses || 0)),
        0
      );
      setTotalAhorrado(Math.max(0, Math.round(total)));

      // 2) Real vs Sugerido (para metaMensual y progreso mensual)
      const rvs = await getMonthlyRealVsSuggested({});
      const serie = rvs.data ?? [];
      const ultimo = serie[serie.length - 1] || { real: 0, suggested: 0 };
      const sug = Number(ultimo.suggested || 0);
      const real = Number(usuarioSeguro(ultimo.real)); // helper abajo por si viene undefined
      setMetaMensualSugerida(Math.round(sug));
      setProgresoMensual(sug > 0 ? Math.round((real / sug) * 100) : 0);

      // 3) Distribución de estados (para metas activas)
      const dist = await getGoalsStatusDistribution({});
      const actRow = (dist.data || []).find((x) => x.status === "Activa");
      setMetasActivas(Number(actRow?.value || 0));

      // 4) Metas para listas (activas + completadas)
      //    Tu adapter ya convierte category/status y trae currentAmount (si backend lo manda).
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
          title: g.name,
          when: niceWhen(g.updatedAt || g.createdAt),
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

  // valores de sparkle de ejemplo (puedes alimentar con algo real si quieres)
  const spark1 = useMemo(() => [45, 48, 52, 60, 62, 67, 72, 74, 78], []);
  const spark2 = useMemo(() => [20, 24, 26, 28, 30, 35, 38, 40, 42], []);
  const spark3 = useMemo(() => [30, 35, 40, 38, 42, 45, 48, 50, 55], []);
  const spark4 = useMemo(() => [40, 45, 47, 50, 55, 58, 60, 62, 63], []);

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
              delta=""
              deltaLabel=""
              positive
              spark={spark1}
              icon={<span className="opacity-70">$</span>}
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Meta Mensual (sugerida)"
              value={`$${Number(metaMensualSugerida).toLocaleString()}`}
              delta=""
              deltaLabel=""
              positive
              spark={spark2}
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Metas Activas"
              value={metasActivas}
              delta=""
              deltaLabel=""
              positive
              spark={spark3}
              loading={loading}
            />
          </div>
          <div className="h-full">
            <StatPro
              title="Progreso Mensual"
              value={`${Number(progresoMensual)}%`}
              delta=""
              deltaLabel=""
              positive
              spark={spark4}
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
              <ScrollArea className={"space-y-3"}>
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
                  <CompletedList items={goalsCompleted} />
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

// Helpers menores
function niceWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}
function usuarioSeguro(n) {
  return Number.isFinite(n) ? n : 0;
}
