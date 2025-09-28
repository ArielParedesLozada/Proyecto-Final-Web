import React, { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ScrollArea from "../components/ui/ScrollArea";
import Empty from "../components/ui/Empty";
import StatsFilters from "../components/stats/StatsFilters";
import ChartPlaceholder from "../components/stats/ChartPlaceholder";
import { ToastProvider, useToast } from "../components/ui/ToastProvider";

import {
  getGoalsStatusDistribution,     
  getMonthlyRealVsSuggested,
  getMonthlyCompletion,
  getCategoryDistribution,
  getMonthlyIncomeExpense,
  getTopGoalsProgress,
} from "../services/stats";

// Recharts
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line,
  PieChart, Pie, Cell,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"];

function StatsPageInner() {
  const toast = useToast();

  const [range, setRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  // datasets
  const [statusPie, setStatusPie] = useState([]);          // <- array [{status, value}]
  const [realVsSuggested, setRealVsSuggested] = useState([]);
  const [monthlyCompletion, setMonthlyCompletion] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [incomeExpense, setIncomeExpense] = useState([]);
  const [topGoals, setTopGoals] = useState([]);

  const chartsRef = useRef(null);

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Estadísticas</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Visualiza el progreso de tus metas y tus hábitos de ahorro
      </p>
    </div>
  );

  // rango válido para enviar al backend
  const validRange = useMemo(() => {
    const { start, end } = range;
    if (!start && !end) return {};            // sin rango → backend usa últimos 6 meses
    if (start && end && end >= start) return { start, end };
    return {};                                // incompleto o inválido → no enviamos nada
  }, [range]);

  async function loadAll() {
    setLoading(true);
    try {
      const params = { ...validRange };

      const [st, rvs, comp, cat, incExp, top] = await Promise.all([
        getGoalsStatusDistribution(params),
        getMonthlyRealVsSuggested(params),
        getMonthlyCompletion(params),
        getCategoryDistribution(params),
        getMonthlyIncomeExpense(params),
        getTopGoalsProgress(params),
      ]);

      setStatusPie(st.data || []);            // <- guardamos el array tal cual
      setRealVsSuggested(rvs.data || []);
      setMonthlyCompletion(comp.data || []);
      setCategoryDist(cat.data || []);
      setIncomeExpense(incExp.data || []);
      setTopGoals(top.data || []);
    } finally {
      setLoading(false);
    }
  }

  // primera carga (backend trae últimos 6 meses por defecto)
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // validación suave de fechas + auto-aplicar cuando el rango es válido
  const lastDateStateRef = useRef("init");
  useEffect(() => {
    const { start, end } = range;

    let state = "none";
    if (start && !end) state = "start-only";
    else if (!start && end) state = "end-only";
    else if (start && end && end < start) state = "invalid";
    else if (start && end) state = "ok";

    if (state === lastDateStateRef.current) return;
    lastDateStateRef.current = state;

    if (state === "start-only") {
      toast.push({
        tone: "info",
        title: "Rango incompleto",
        message: 'Selecciona también "Fecha fin" para aplicar el rango.',
      });
      return;
    }
    if (state === "end-only") {
      toast.push({
        tone: "info",
        title: "Rango incompleto",
        message: 'Selecciona también "Fecha inicio" para aplicar el rango.',
      });
      return;
    }
    if (state === "invalid") {
      toast.push({
        tone: "error",
        title: "Rango inválido",
        message: "La fecha fin no puede ser anterior a la fecha inicio.",
      });
      return;
    }
    if (state === "ok" || (state === "none" && (validRange.start === undefined))) {
      // ok → aplica; none → vuelve a modo 'por defecto' (últimos 6 meses)
      loadAll();
    }
  }, [range, toast, validRange.start]);

  const onClear = () => {
    setRange({ start: "", end: "" });
    toast.push({ tone: "success", title: "Filtros limpiados", message: "Se restableció el rango por defecto." });
  };

  const onDownloadPDF = async () => {
    if (!chartsRef.current) return;

    const canvas = await html2canvas(chartsRef.current, {
      backgroundColor: "#0b1220",
      scale: 2,
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("estadisticas_metas.pdf");
  };

  // total para decidir si mostramos el donut o el Empty
  const statusTotal = statusPie.reduce((acc, it) => acc + (it?.value || 0), 0);

  return (
    <AppLayout header={header}>
      <div className="flex flex-col min-h-0 xl:h-full gap-4">
        <StatsFilters
          start={range.start}
          end={range.end}
          onChange={(partial) => setRange((r) => ({ ...r, ...partial }))}
          onClear={onClear}
          onDownload={onDownloadPDF}
        />

        <ScrollArea className="">
          <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1) Estados de las metas (donut) */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Estados de las metas</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Activas vs Completadas vs Vencidas
                </p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="pie" height={240} />
              ) : statusTotal === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay metas en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={statusPie}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {statusPie.map((_, i) => (
                          <Cell key={i} fill={[COLORS[0], COLORS[1], COLORS[2]][i % 3]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 2) Real vs Sugerido mensual */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Ahorro real vs sugerido</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Suma mensual (todos tus objetivos)</p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="line" height={240} />
              ) : realVsSuggested.length === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay movimientos en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realVsSuggested}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="real" name="Real" stroke={COLORS[0]} dot={false} />
                      <Line type="monotone" dataKey="suggested" name="Sugerido" stroke={COLORS[2]} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 3) Cumplimiento mensual */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Cumplimiento mensual</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Promedio de avance (%) al cierre de cada mes</p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="line" height={240} />
              ) : monthlyCompletion.length === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay información de cumplimiento en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyCompletion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                      <Line type="monotone" dataKey="completion" name="Cumplimiento" stroke={COLORS[1]} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 4) Categorías de metas */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Categorías de metas</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Distribución por categoría</p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="pie" height={240} />
              ) : categoryDist.length === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay metas en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={categoryDist}
                        dataKey="value"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {categoryDist.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 5) Ingresos vs Gastos mensual */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Ingresos vs Gastos (mensual)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Suma mensual de ingresos y gastos</p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="bar" height={240} />
              ) : incomeExpense.length === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay movimientos en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeExpense}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="incomes" name="Ingresos" fill={COLORS[1]} />
                      <Bar dataKey="expenses" name="Gastos" fill={COLORS[3]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 6) Top 5 metas por avance */}
            <div className="fin-card p-4">
              <div className="mb-2">
                <h3 className="font-semibold">Top 5 metas por avance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Metas con mayor % de progreso en el rango</p>
              </div>

              {loading ? (
                <ChartPlaceholder variant="bar" height={240} />
              ) : topGoals.length === 0 ? (
                <div className="h-[260px] flex items-center">
                  <Empty title="Sin datos" subtitle="No hay metas destacadas en el rango." />
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGoals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                      <Bar dataKey="progress" name="Progreso (%)" fill={COLORS[5]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}

export default function StatsPage() {
  return (
    <ToastProvider placement="top-right">
      <StatsPageInner />
    </ToastProvider>
  );
}
