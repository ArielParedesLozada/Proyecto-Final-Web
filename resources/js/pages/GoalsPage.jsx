import React, { useEffect, useMemo, useState } from "react";
import GoalGrid from "../components/goals/GoalGrid";
import NewGoalModal from "../components/goals/NewGoalModal";
import EmptyGoals from "../components/goals/EmptyGoals";
import { GoalsAPI } from "../services/API";
import AppLayout from "../layouts/AppLayout";


export default function GoalsPage() {
    // Estado
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Paginación
    const [page, setPage] = useState(1);
    const pageSize = 4;
    const [total, setTotal] = useState(0);

    // ------- Carga inicial / refresco --------
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const res = await GoalsAPI.list({ page, pageSize });
                if (!mounted) return;
                setGoals(res.data);
                setTotal(res.total);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => (mounted = false);
    }, [page]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // ------- Callbacks -------
    async function handleCreateGoal(payload) {
        await GoalsAPI.create(payload);
        setPage(1); // volver a la primera página para ver la nueva meta
        const res = await GoalsAPI.list({ page: 1, pageSize });
        setGoals(res.data);
        setTotal(res.total);
        setModalOpen(false);
    }

    async function handleDeleteGoal(id) {
        await GoalsAPI.remove(id);
        const nextPage = Math.min(page, Math.ceil((total - 1) / pageSize) || 1);
        setPage(nextPage);
        const res = await GoalsAPI.list({ page: nextPage, pageSize });
        setGoals(res.data);
        setTotal(res.total);
    }

    function handleEditGoal(goal) {
        console.log("Editar", goal);
    }

    function handleAddTx(goal) {
        console.log("Agregar Ingreso/Gasto a", goal);
    }

    // ------- Render -------
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header + CTA */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold">Metas de Ahorro</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gestiona y da seguimiento a tus objetivos financieros
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        + Nueva Meta
                    </button>
                </div>

                {loading ? (
                    <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
                        Cargando…
                    </div>
                ) : goals.length === 0 ? (
                    <EmptyGoals onCreate={() => setModalOpen(true)} />
                ) : (
                    <>
                        <GoalGrid
                            goals={goals}
                            onAddTx={handleAddTx}
                            onEdit={handleEditGoal}
                            onDelete={handleDeleteGoal}
                        />

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <button
                                    className="btn btn-ghost"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Anterior
                                </button>
                                <span className="text-sm px-2 py-1 rounded-lg bg-white/70 dark:bg-gray-800/70">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    className="btn btn-ghost"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Nueva Meta */}
                <NewGoalModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleCreateGoal}
                />
            </div>
        </AppLayout>
    );

}
