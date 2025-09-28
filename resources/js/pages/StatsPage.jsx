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
  downloadStatsPDF,
} from "../services/stats";

// Recharts
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  LineChart, Line,
  PieChart, Pie, Cell,
} from "recharts";

// Paleta de colores moderna y profesional
const COLORS = {
  primary: "#6366F1",     // Indigo principal
  success: "#10B981",     // Emerald
  warning: "#F59E0B",     // Amber
  danger: "#EF4444",      // Red
  info: "#06B6D4",        // Cyan
  purple: "#8B5CF6",      // Violet
  gradient: {
    primary: ["#6366F1", "#4F46E5"],
    success: ["#10B981", "#059669"],
    warning: ["#F59E0B", "#D97706"],
    danger: ["#EF4444", "#DC2626"],
    info: ["#06B6D4", "#0891B2"],
    purple: ["#8B5CF6", "#7C3AED"]
  }
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success, 
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.purple
];

function StatsPageInner() {
  const toast = useToast();

  const [range, setRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // datasets
  // ⚠️ El backend devuelve array: [{status: 'Activa', value: 3}, ...]
  const [statusData, setStatusData] = useState([]);
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

      setStatusData(Array.isArray(st.data) ? st.data : []);
      setRealVsSuggested(rvs.data || []);
      setMonthlyCompletion(comp.data || []);
      setCategoryDist(cat.data || []);
      setIncomeExpense(incExp.data || []);
      setTopGoals(top.data || []);
    } catch (e) {
      toast.push({ tone: "error", title: "Error", message: "No se pudieron cargar las estadísticas." });
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

    if (state === "ok" || state === "none") loadAll();
  }, [range, toast]);

  const onClear = () => {
    setRange({ start: "", end: "" });
    toast.push({ tone: "success", title: "Filtros limpiados", message: "Se restableció el rango por defecto." });
  };

  const onDownloadPDF = async () => {
    try {
      setDownloading(true);
      const params = { ...validRange }; 
      const res = await downloadStatsPDF(params);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "estadisticas_metas.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.push({ tone: "error", title: "Descarga fallida", message: "No se pudo generar el PDF." });
    } finally {
      setDownloading(false);
    }
  };

  const pieData = useMemo(() => {
    return (Array.isArray(statusData) ? statusData : []).map((x) => ({
      name: x.status,
      value: Number(x.value) || 0,
    }));
  }, [statusData]);

  const statusTotal = useMemo(
    () => pieData.reduce((acc, it) => acc + (it.value || 0), 0),
    [pieData]
  );

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
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estados de las metas</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Distribución entre metas activas, completadas y vencidas
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
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [`${value} metas`, name]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth={2}
                      >
                        {pieData.map((_, i) => (
                          <Cell 
                            key={i} 
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            stroke="rgba(255, 255, 255, 0.8)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 2) Real vs Sugerido mensual */}
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ahorro real vs sugerido</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Comparación entre el ahorro real y el sugerido mensualmente
                </p>
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
                      <defs>
                        <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="suggestedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [`$${value}`, name]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="real" 
                        name="Real" 
                        stroke={COLORS.success} 
                        strokeWidth={3}
                        dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: COLORS.success, strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="suggested" 
                        name="Sugerido" 
                        stroke={COLORS.warning} 
                        strokeWidth={3}
                        dot={{ fill: COLORS.warning, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: COLORS.warning, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 3) Cumplimiento mensual */}
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cumplimiento mensual</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Promedio de avance porcentual al cierre de cada mes
                </p>
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
                      <defs>
                        <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(v) => [`${v}%`, 'Cumplimiento']}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completion" 
                        name="Cumplimiento" 
                        stroke={COLORS.warning} 
                        strokeWidth={3}
                        dot={{ fill: COLORS.warning, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: COLORS.warning, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 4) Categorías de metas */}
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorías de metas</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Distribución de metas por categoría de ahorro
                </p>
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
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [`${value} metas`, name]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Pie
                        data={categoryDist}
                        dataKey="value"
                        nameKey="category"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth={2}
                      >
                        {categoryDist.map((_, idx) => (
                          <Cell 
                            key={idx} 
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                            stroke="rgba(255, 255, 255, 0.8)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 5) Ingresos vs Gastos mensual */}
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ingresos vs Gastos</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Comparación mensual entre ingresos y gastos totales
                </p>
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
                    <BarChart data={incomeExpense} barCategoryGap="20%">
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value, name) => [`$${value}`, name]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="incomes" 
                        name="Ingresos" 
                        fill="url(#incomeGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={COLORS.success}
                        strokeWidth={1}
                      />
                      <Bar 
                        dataKey="expenses" 
                        name="Gastos" 
                        fill="url(#expenseGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={COLORS.danger}
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 6) Top 5 metas por avance */}
            <div className="fin-card p-6 card-hover">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top 5 metas por avance</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-5">
                  Metas con mayor porcentaje de progreso en el período
                </p>
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
                    <BarChart data={topGoals} barCategoryGap="10%">
                      <defs>
                        {topGoals.map((_, index) => (
                          <linearGradient key={index} id={`progressGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS[index % CHART_COLORS.length]} stopOpacity={0.4}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: 'rgba(156, 163, 175, 0.3)' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(v) => [`${v}%`, 'Progreso']}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="rect"
                      />
                      <Bar 
                        dataKey="progress" 
                        name="Progreso (%)" 
                        radius={[4, 4, 0, 0]}
                        strokeWidth={1}
                      >
                        {topGoals.map((_, index) => (
                          <Cell 
                            key={index} 
                            fill={`url(#progressGradient${index})`}
                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
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
