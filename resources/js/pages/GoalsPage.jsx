import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalGrid from "../components/goals/GoalGrid";
import NewGoalModal from "../components/goals/NewGoalModal";
import EmptyGoals from "../components/goals/EmptyGoals";
import ConfirmModal from "../components/common/ConfirmModal";
import { GoalsAPI } from "../services/API";

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // modal crear/editar
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [editingGoal, setEditingGoal] = useState(null);

    // confirm delete
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState(null);

    // paginación
    const [page, setPage] = useState(1);
    const pageSize = 4; // lo que definiste
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    async function load(p = page) {
        setLoading(true);
        try {
            const res = await GoalsAPI.list({ page: p, pageSize });
            setGoals(res.data);
            setTotal(res.total);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Crear
    async function handleCreateGoal(payload) {
        await GoalsAPI.create(payload);
        setModalOpen(false);
        setPage(1);
        await load(1);
    }

    // Editar
    function handleEditGoal(goal) {
        setEditingGoal(goal);
        setModalMode("edit");
        setModalOpen(true);
    }

    async function handleSubmitEdit(payload) {
        // payload trae { id, ...campos }
        const { id, ...rest } = payload;
        await GoalsAPI.update(id, rest);
        setModalOpen(false);
        setEditingGoal(null);
        await load(page);
    }

    // Eliminar
    function askDelete(id) {
        setToDeleteId(id);
        setConfirmOpen(true);
    }

    async function confirmDelete() {
        if (toDeleteId == null) return;
        await GoalsAPI.remove(toDeleteId);
        setConfirmOpen(false);
        const next = Math.min(page, Math.ceil((total - 1) / pageSize) || 1);
        setPage(next);
        await load(next);
    }

    return (
        <AppLayout
            title="Metas de Ahorro"
            subtitle="Gestiona y da seguimiento a tus objetivos financieros"
        >
            <div className="space-y-6">
                {/* Header + CTA */}
                <div className="flex items-start justify-between gap-3">
                    <div />
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setModalMode("create");
                            setEditingGoal(null);
                            setModalOpen(true);
                        }}
                    >
                        + Nueva Meta
                    </button>
                </div>

                {loading ? (
                    <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
                        Cargando…
                    </div>
                ) : goals.length === 0 ? (
                    <EmptyGoals onCreate={() => {
                        setModalMode("create");
                        setEditingGoal(null);
                        setModalOpen(true);
                    }} />
                ) : (
                    <>
                        <GoalGrid
                            goals={goals}
                            onAddTx={(g) => console.log("Agregar Ingreso/Gasto a", g)}
                            onEdit={handleEditGoal}
                            onDelete={askDelete}
                        />

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

                {/* Modal Crear / Editar */}
                <NewGoalModal
                    open={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingGoal(null);
                    }}
                    onSubmit={modalMode === "edit" ? handleSubmitEdit : handleCreateGoal}
                    mode={modalMode}
                    initialGoal={editingGoal}
                />

                {/* Confirmación de eliminación */}
                <ConfirmModal
                    open={confirmOpen}
                    title="Eliminar meta"
                    message="¿Estás seguro de eliminar esta meta? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar"
                    cancelText="Cancelar"
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </AppLayout>
    );
}
