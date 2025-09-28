import React, { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ScrollArea from "../components/ui/ScrollArea";
import StatsFilters from "../components/stats/StatsFilters";
import ChartPlaceholder from "../components/stats/ChartPlaceholder";

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

// PDF
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Paletas suaves
const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"];

export default function StatsPage() {
  const [range, setRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  // NUEVO: distribución de estados
  const [statusDist, setStatusDist] = useState([]);               // dona estados
  const [realVsSuggested, setRealVsSuggested] = useState([]);     // líneas
  const [monthlyCompletion, setMonthlyCompletion] = useState([]); // línea %
  const [categoryDist, setCategoryDist] = useState([]);           // pie categorías
  const [incomeExpense, setIncomeExpense] = useState([]);         // barras
  const [topGoals, setTopGoals] = useState([]);                   // barras top

  const chartsRef = useRef(null);

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Estadísticas</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Visualiza el progreso de tus metas y tus hábitos de ahorro
      </p>
    </div>
  );

  const validRange = useMemo(() => {
    const { start, end } = range;
    if (!start && !end) return {};
    if (start && end && end >= start) return { start, end };
    return {};
  }, [range]);

  async function loadAll() {
    setLoading(true);
    try {
      const params = { ...validRange }; // {start,end} o {}
      const [p1, p2, p3, p4, p5, p6] = await Promise.all([
        getGoalsStatusDistribution(params),
        getMonthlyRealVsSuggested(params),
        getMonthlyCompletion(params),
        getCategoryDistribution(params),
        getMonthlyIncomeExpense(params),
        getTopGoalsProgress(params),
      ]);

      setStatusDist(p1.data || []);
      setRealVsSuggested(p2.data || []);
      setMonthlyCompletion(p3.data || []);
      setCategoryDist(p4.data || []);
      setIncomeExpense(p5.data || []);
      setTopGoals(p6.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClear = () => setRange({ start: "", end: "" });
  const onApply = () => loadAll();

  const onDownloadPDF = async () => {
    if (!chartsRef.current) return;
    const canvas = await html2canvas(chartsRef.current, {
      backgroundColor: "#0b1220",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("estadisticas_metas.pdf");
  };

  // Colores fijos para estados: Activa/Completada/Vencida
  const STATUS_COLORS = {
    Activa: "#22C55E",
    Completada: "#6366F1",
    Vencida: "#EF4444",
  };

  return (
    <AppLayout header={header}>
      <div className="flex flex-col min-h-0 xl:h-full gap-4">
        <StatsFilters
          start={range.start}
          end={range.end}
          onChange={(partial) => setRange((r) => ({ ...r, ...partial }))}
          onClear={onClear}
          onApply={onApply}
          onDownload={onDownloadPDF}
        />

        <ScrollArea>
          <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1) Distribución de estados (dona) — REEMPLAZA la gráfica anterior */}
            <div className="fin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Estados de las metas</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activas vs Completadas vs Vencidas
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="pie" height={240} />
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => `${v} metas`} />
                      <Legend />
                      <Pie
                        data={statusDist}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {statusDist.map((s, idx) => (
                          <Cell
                            key={idx}
                            fill={STATUS_COLORS[s.status] || COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 2) Real vs Sugerido mensual (líneas) */}
            <div className="fin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Ahorro real vs sugerido</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Suma mensual (todos tus objetivos)
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="line" height={240} />
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

            {/* 3) Cumplimiento mensual (%) */}
            <div className="fin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Cumplimiento mensual</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Promedio de avance (%) al cierre de cada mes
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="line" height={240} />
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

            {/* 4) Categorías (dona) */}
            <div className="fin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Categorías de metas</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Distribución por categoría
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="pie" height={240} />
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v) => `${v} metas`} />
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
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Ingresos vs Gastos (mensual)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Suma mensual de ingresos y gastos
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="bar" height={240} />
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeExpense}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="incomes" name="Ingresos" fill="#22C55E" />
                      <Bar dataKey="expenses" name="Gastos" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 6) Top 5 metas por avance */}
            <div className="fin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">Top 5 metas por avance</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Metas con mayor % de progreso en el rango
                  </p>
                </div>
              </div>
              {loading ? (
                <ChartPlaceholder variant="bar" height={240} />
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
