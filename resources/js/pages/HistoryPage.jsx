import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { GoalsAPI } from "../services/API";
import ScrollArea from "../components/ui/ScrollArea";
import GoalHistoryRow from "../components/history/GoalHistoryRow";
import Paginator from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function load(p = page) {
    setLoading(true);
    try {
      // Demo: reutilizamos GoalsAPI.list
      const res = await GoalsAPI.list({ page: p, pageSize });
      setItems(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openDetails(goal) {
    // abre modal o navega a /goals/:id
    console.log("Ver más de", goal);
  }

  // Header
  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Historial</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Consulta y revisa el registro de tus metas de ahorro
      </p>
    </div>
  );

  // Si quieres una barra de filtros/acciones futura, déjala como toolbar
  const Toolbar = <div className="mb-4 md:mb-5" />;

  return (
    <AppLayout header={header}>
      {/* En móvil: flujo natural.
          En XL: ResponsivePane calcula altura disponible (debajo del toolbar) y aplica scroll interno. */}
      <ResponsivePane toolbar={Toolbar}>
        {/* Contenido scrolleable en XL; en móvil fluye */}
        <ScrollArea className="space-y-3">
          {loading ? (
            <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
              Cargando…
            </div>
          ) : items.length === 0 ? (
            <div className="fin-card p-8 md:p-10 text-center">
              <h3 className="text-base md:text-lg font-semibold mb-1">
                Sin historial aún
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cuando registres metas e ingresos/gastos, verás su progreso aquí.
              </p>
            </div>
          ) : (
            <>
              {/* UNA POR FILA (full width) */}
              <div className="space-y-3">
                {items.map((g) => (
                  <GoalHistoryRow key={g.id} goal={g} onOpen={openDetails} />
                ))}
              </div>

              {/* Paginación reutilizable */}
              <Paginator
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="justify-center py-2"
              />
            </>
          )}
        </ScrollArea>
      </ResponsivePane>
    </AppLayout>
  );
}
