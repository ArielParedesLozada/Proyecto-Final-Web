import React, { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import { GoalsAPI } from "../services/API";
import ScrollArea from "../components/ui/ScrollArea";
import GoalHistoryRow from "../components/history/GoalHistoryRow";
import Paginator from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";
import GoalDetailsModal from "../components/history/GoalDetailsModal";

export default function HistoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // paginación
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // modal detalle
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailGoal, setDetailGoal] = useState(null);

    async function load(p = page) {
        setLoading(true);
        try {
            const res = await GoalsAPI.list({ page: p, pageSize });
            setItems(res.data);
            setTotal(res.total);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    function openDetails(goal) {
        setDetailGoal(goal);
        setDetailOpen(true);
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
            <ResponsivePane toolbar={null}>
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
                            <div className="space-y-3">
                                {items.map((g) => (
                                    <GoalHistoryRow key={g.id} goal={g} onOpen={openDetails} />
                                ))}
                            </div>

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
