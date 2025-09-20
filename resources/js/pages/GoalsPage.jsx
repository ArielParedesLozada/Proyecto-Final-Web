import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalGrid from "../components/goals/GoalGrid";
import NewGoalModal from "../components/goals/NewGoalModal";
import EmptyGoals from "../components/goals/EmptyGoals";
import ConfirmModal from "../components/common/ConfirmModal";
import AddTxModal from "../components/goals/AddTxModal";
import { GoalsAPI } from "../services/API";
import Pagination from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";

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

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 4;
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

  // ===== Ingreso / Gasto =====
  function handleAddTx(goal) {
    setTxGoal(goal);
    setTxOpen(true);
  }

  async function handleSaveTx({ goalId, type, amount }) {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const delta = type === "income" ? amount : -amount;
      const newAmount = Math.max(0, (goal.currentAmount ?? 0) + delta);

      await GoalsAPI.update(goalId, { currentAmount: newAmount });
      setTxOpen(false);
      setTxGoal(null);
      await load(page);
    } catch (e) {
      console.error(e);
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
