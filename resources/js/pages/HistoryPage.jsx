import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import ScrollArea from "../components/ui/ScrollArea";
import Pagination from "../components/ui/Pagination";
import Empty from "../components/ui/Empty";
import GoalHistoryRow from "../components/history/GoalHistoryRow";
import GoalDetailsModal from "../components/history/GoalDetailsModal";
import { listGoals, getGoal } from "../services/goals";
import { goalApiToUi } from "../services/adapters";

export default function HistoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // paginación
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1); // preferimos lo que diga el backend

    // modal detalle
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailGoal, setDetailGoal] = useState(null);

    const firstLoadRef = useRef(true);

    async function load(p = page, { silent = false } = {}) {
        if (!silent) setLoading(true);
        try {
            const res = await listGoals({ page: p, pageSize });
            const rows = (res.data ?? []).map(goalApiToUi);

            setItems(rows);
            setTotal(res.total ?? rows.length);

            const lp =
                res.last_page ??
                Math.max(
                    1,
                    Math.ceil((res.total ?? rows.length) / (res.per_page ?? pageSize))
                );
            setLastPage(lp);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    useEffect(() => {
        const silent = !firstLoadRef.current; // solo la primera carga muestra loader
        load(page, { silent }).finally(() => {
            firstLoadRef.current = false;
        });
    }, [page]);

    async function openDetails(goal) {
        try {
            const detail = await getGoal(goal.id);
            setDetailGoal(goalApiToUi(detail.data));
        } catch {
            setDetailGoal(goal);
        } finally {
            setDetailOpen(true);
        }
    }

    const header = (
        <div>
            <h1 className="text-lg md:text-xl font-semibold">Historial</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Consulta y revisa el registro de tus metas de ahorro
            </p>
        </div>
    );

    return (
        <AppLayout header={header}>
            <ResponsivePane>
                <ScrollArea className="space-y-3">
                    {loading ? (
                        <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
                            Cargando…
                        </div>
                    ) : items.length === 0 ? (
                        <Empty
                            title="Sin historial aún"
                            subtitle="Cuando registres metas e ingresos/gastos, verás su progreso aquí."
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {items.map((g) => (
                                    <GoalHistoryRow key={g.id} goal={g} onOpen={openDetails} />
                                ))}
                            </div>

                            <Pagination
                                page={page}
                                totalPages={lastPage}
                                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                                onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
                                className="justify-center py-2"
                            />
                        </>
                    )}
                </ScrollArea>
            </ResponsivePane>

            {/* Modal de detalles */}
            <GoalDetailsModal
                open={detailOpen}
                goal={detailGoal}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailGoal(null);
                }}
            />
        </AppLayout>
    );
}
