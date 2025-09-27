import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalGrid from "../components/goals/GoalGrid";
import NewGoalModal from "../components/goals/NewGoalModal";
import EmptyGoals from "../components/goals/EmptyGoals";
import ConfirmModal from "../components/common/ConfirmModal";
import AddTxModal from "../components/goals/AddTxModal";
import Pagination from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";

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

export default function GoalsPage() {
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await listGoals({ page: p, pageSize });
      const rows = (res.data ?? []).map(goalApiToUi);
      setGoals(rows);
      setTotal(res.total ?? rows.length);
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
    await createGoal(goalUiToApi(payload));
    setModalOpen(false);
    setPage(1);
    await load(1);
  }

  // Editar (abrir modal con data)
  function handleEditGoal(goal) {
    setEditingGoal(goal);
    setModalMode("edit");
    setModalOpen(true);
  }

  // Guardar edición
  async function handleSubmitEdit(payload) {
    const { id, ...rest } = payload;
    await updateGoal(id, goalUiToApi(rest));
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
    await deleteGoal(toDeleteId);
    setConfirmOpen(false);
    const next = Math.min(page, Math.ceil((total - 1) / pageSize) || 1);
    setPage(next);
    await load(next);
  }

  function handleAddTx(goal) {
    setTxGoal(goal);
    setTxOpen(true);
  }

  async function handleSaveTx({ goalId, type, kind, amount }) {
    const delta = type === "income" ? Number(amount) : -Number(amount);

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
            ...g,
            currentAmount: Math.max(
              0,
              Math.min(g.targetAmount, (g.currentAmount || 0) + delta)
            ),
          }
          : g
      )
    );

    try {
      // 2) Guardar en el backend
      await addTransaction(goalId, {
        type,                 // 'income' | 'expense'
        is_fixed: kind === "Fijo",
        amount: Number(amount),
      });

      try {
        const detail = await getGoal(goalId);
        const updated = goalApiToUi(detail.data);
        setGoals((arr) => arr.map((g) => (g.id === goalId ? updated : g)));
      } catch {
        // Si no hay endpoint de detalle usable, recarga toda la lista
        await load(page);
      }
    } catch (e) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
              ...g,
              currentAmount: Math.max(
                0,
                Math.min(g.targetAmount, (g.currentAmount || 0) - delta)
              ),
            }
            : g
        )
      );
      console.error(e);
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
      {/* Pane reutilizable: toolbar fija + contenido scrolleable (solo en XL) */}
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
          <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
            Cargando…
          </div>
        ) : goals.length === 0 ? (
          <EmptyGoals
            onCreate={() => {
              setModalMode("create");
              setEditingGoal(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <>
            <GoalGrid
              goals={goals}
              onAddTx={handleAddTx}
              onEdit={handleEditGoal}
              onDelete={askDelete}
            />

            {/* Paginación simple */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </ResponsivePane>

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

      {/* Modal Ingreso/Gasto */}
      <AddTxModal
        open={txOpen}
        onClose={() => setTxOpen(false)}
        goal={txGoal}
        onSubmit={handleSaveTx}
      />
    </AppLayout>
  );
}
