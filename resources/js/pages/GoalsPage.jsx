import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalGrid from "../components/goals/GoalGrid";
import NewGoalModal from "../components/goals/NewGoalModal";
import ConfirmModal from "../components/common/ConfirmModal";
import AddTxModal from "../components/goals/AddTxModal";
import Pagination from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";
import Empty from "../components/ui/Empty";

// Toasts
import { ToastProvider, useToast } from "../components/ui/ToastProvider";

// Servicios reales
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoal,
} from "../services/goals";
import { addTransaction } from "../services/transactions";
import { goalApiToUi, goalUiToApi } from "../services/adapters";

function GoalsPageInner() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingGoal, setEditingGoal] = useState(null);

  // confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // modal de transacción
  const [txOpen, setTxOpen] = useState(false);
  const [txGoal, setTxGoal] = useState(null);

  // paginación (UI)
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const toast = useToast();

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await listGoals({ page: p, pageSize });
      const rows = (res.data ?? []).map(goalApiToUi);
      setGoals(rows);
      setTotal(res.total ?? rows.length);
      const lp =
        res.last_page ??
        Math.max(1, Math.ceil((res.total ?? rows.length) / (res.per_page ?? pageSize)));
      setLastPage(lp);
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
    try {
      await createGoal(goalUiToApi(payload));
      toast.push({ tone: "success", title: "Meta creada", message: "Tu meta se guardó correctamente." });
      setModalOpen(false);
      setPage(1);
      await load(1);
    } catch (e) {
      toast.push({ tone: "error", title: "Error al crear", message: e?.message || "No se pudo crear la meta." });
    }
  }

  // Editar
  function handleEditGoal(goal) {
    setEditingGoal(goal);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmitEdit(payload) {
    const { id, ...rest } = payload;
    try {
      await updateGoal(id, goalUiToApi(rest));
      toast.push({ tone: "success", title: "Cambios guardados" });
      setModalOpen(false);
      setEditingGoal(null);
      await load(page);
    } catch (e) {
      toast.push({ tone: "error", title: "Error al actualizar", message: e?.message || "No se pudo actualizar la meta." });
    }
  }

  // Eliminar
  function askDelete(id) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (toDeleteId == null) return;
    try {
      await deleteGoal(toDeleteId);
      toast.push({ tone: "success", title: "Meta eliminada" });
      setConfirmOpen(false);
      const nextPage = Math.min(page, lastPage);
      await load(nextPage);
      setPage((p) => Math.min(p, lastPage));
    } catch (e) {
      toast.push({ tone: "error", title: "Error al eliminar", message: e?.message || "No se pudo eliminar la meta." });
    }
  }

  // Ingreso / Gasto
  function handleAddTx(goal) {
    setTxGoal(goal);
    setTxOpen(true);
  }

  async function handleSaveTx({ goalId, type, kind, amount }) {
    const delta = type === "income" ? Number(amount) : -Number(amount);

    // Optimistic UI
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.max(0, Math.min(g.targetAmount, (g.currentAmount || 0) + delta)) }
          : g
      )
    );

    try {
      await addTransaction(goalId, {
        type,
        is_fixed: kind === "Fijo",
        amount: Number(amount),
      });

      try {
        const detail = await getGoal(goalId);
        const updated = goalApiToUi(detail.data);
        setGoals((arr) => arr.map((g) => (g.id === goalId ? updated : g)));
      } catch {
        await load(page);
      }

      toast.push({
        tone: "success",
        title: type === "income" ? "Ingreso registrado" : "Gasto registrado",
        message: `${type === "income" ? "+" : "-"}$${Number(amount).toLocaleString()}`,
      });
    } catch (e) {
      // revertir optimistic UI
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, currentAmount: Math.max(0, Math.min(g.targetAmount, (g.currentAmount || 0) - delta)) }
            : g
        )
      );
      toast.push({ tone: "error", title: "Error al guardar", message: e?.message || "No se pudo registrar el movimiento." });
    } finally {
      setTxOpen(false);
      setTxGoal(null);
    }
  }

  // ----- Header (texto) -----
  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Metas de Ahorro</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Gestiona y da seguimiento a tus objetivos financieros
      </p>
    </div>
  );

  return (
    <AppLayout header={header}>
      <ResponsivePane
        toolbar={
          <div className="flex items-center justify-end">
            <button
              className="btn btn-primary cursor-pointer shadow-sm"
              onClick={() => {
                setModalMode("create");
                setEditingGoal(null);
                setModalOpen(true);
              }}
            >
              + Nueva Meta
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">Cargando…</div>
        ) : goals.length === 0 ? (
          <Empty
            title="Aún no tienes metas de ahorro"
            subtitle="Crea tu primera meta para comenzar a registrar tu progreso financiero."
          />
        ) : (
          <>
            <GoalGrid goals={goals} onAddTx={handleAddTx} onEdit={handleEditGoal} onDelete={askDelete} />

            <Pagination
              page={page}
              totalPages={lastPage}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
            />
          </>
        )}
      </ResponsivePane>

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

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar meta"
        message="¿Estás seguro de eliminar esta meta? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <AddTxModal open={txOpen} onClose={() => setTxOpen(false)} goal={txGoal} onSubmit={handleSaveTx} />
    </AppLayout>
  );
}

export default function GoalsPage() {
  // Montamos el provider aquí para que solo esta página lo use.
  return (
    <ToastProvider placement="top-right">
      <GoalsPageInner />
    </ToastProvider>
  );
}
