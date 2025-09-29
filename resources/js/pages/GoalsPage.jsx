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
import { addTransaction, createRecurringRule } from "../services/transactions";
import { goalApiToUi, goalUiToApi } from "../services/adapters";
import useCache from "../hooks/useCache";

function GoalsPageInner() {
  const { fetchWithCache, invalidateCache } = useCache();
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

  // Función auxiliar para filtrar metas completadas
  const filterCompletedGoals = (goals) => {
    return goals.filter(goal => {
      const progress = Math.min(
        100,
        Math.round(((goal.currentAmount ?? 0) / Math.max(goal.targetAmount, 1)) * 100)
      );
      return progress < 100;
    });
  };

  // Carga con opción "silenciosa" (no muestra loader)
  async function load(p = page, { silent = false, forceRefresh = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const cacheKey = `goals-page-${p}`;
      const res = await fetchWithCache(
        cacheKey,
        () => listGoals({ page: p, pageSize }),
        { forceRefresh }
      );
      
      if (res) {
        const rows = (res.data ?? []).map(goalApiToUi);
        
        // Filtrar metas completadas automáticamente
        const activeGoals = filterCompletedGoals(rows);
        
        setGoals(activeGoals);
        setTotal(activeGoals.length);
        const lp = Math.max(1, Math.ceil(activeGoals.length / pageSize));
        setLastPage(lp);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    // Al cambiar de página sí queremos mostrar loader
    load(page, { silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Crear (optimista + refresh silencioso)
  async function handleCreateGoal(payload) {
    try {
      const resp = await createGoal(goalUiToApi(payload));
      toast.push({ tone: "success", title: "Meta creada" });
      setModalOpen(false);

      // Invalidar caché y refrescar
      invalidateCache('goals-page');
      setPage(1);
      await load(1, { silent: true, forceRefresh: true });
    } catch (e) {
      toast.push({ tone: "error", title: "Error al crear", message: e?.message || "No se pudo crear la meta." });
    }
  }

  // Editar (optimista + refresh silencioso)
  function handleEditGoal(goal) {
    setEditingGoal(goal);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSubmitEdit(payload) {
    const { id, ...rest } = payload;
    setGoals((prev) => {
      const updated = prev.map((g) =>
        g.id === id
          ? {
            ...g,
            name: rest.name ?? g.name,
            category: rest.category ?? g.category,
            description: rest.description ?? g.description,
            targetAmount: typeof rest.targetAmount === "number" ? rest.targetAmount : g.targetAmount,
            deadline: rest.deadline ?? g.deadline,
            status: rest.status ?? g.status,
          }
          : g
      );
      // Filtrar metas completadas automáticamente
      return filterCompletedGoals(updated);
    });

    try {
      await updateGoal(id, goalUiToApi(rest));
      toast.push({ tone: "success", title: "Cambios guardados" });

      // Traer versión canónica del back 
      try {
        const detail = await getGoal(id);
        const updated = goalApiToUi(detail.data);
        setGoals((arr) => {
          const updatedArr = arr.map((g) => (g.id === id ? updated : g));
          // Filtrar metas completadas automáticamente
          return filterCompletedGoals(updatedArr);
        });
      } catch {
        // si falla el detalle, recargamos la página de forma silenciosa
        await load(page, { silent: true });
      }
    } catch (e) {
      toast.push({ tone: "error", title: "Error al actualizar", message: e?.message || "No se pudo actualizar la meta." });
      // Podríamos revertir, pero la previa recarga silenciosa al fallar ya "corrige" el estado:
      invalidateCache('goals-page');
      await load(page, { silent: true, forceRefresh: true });
    } finally {
      setModalOpen(false);
      setEditingGoal(null);
    }
  }

  // Eliminar (optimista + refresh silencioso)
  function askDelete(id) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (toDeleteId == null) return;

    // Optimista: eliminamos de la lista al instante
    setGoals((prev) => prev.filter((g) => g.id !== toDeleteId));
    setConfirmOpen(false);

    try {
      await deleteGoal(toDeleteId);
      toast.push({ tone: "success", title: "Meta eliminada" });

      // Invalidar caché
      invalidateCache('goals-page');

      // Si quedó la página vacía, traer contenido de la previa; siempre en silencio
      const afterDeleteCount = goals.length - 1;
      const pageNowEmpty = afterDeleteCount === 0 && page > 1;
      const nextPage = pageNowEmpty ? page - 1 : page;

      setPage(nextPage); // actualiza el pager
      await load(nextPage, { silent: true, forceRefresh: true });
    } catch (e) {
      toast.push({ tone: "error", title: "Error al eliminar", message: e?.message || "No se pudo eliminar la meta." });
      // Recuperar estado real desde el back sin loader
      invalidateCache('goals-page');
      await load(page, { silent: true, forceRefresh: true });
    } finally {
      setToDeleteId(null);
    }
  }

  // Ingreso / Gasto (optimista + refresh silencioso)
  function handleAddTx(goal) {
    setTxGoal(goal);
    setTxOpen(true);
  }

  async function handleSaveTx({ goalId, type, kind, amount, frequency }) {
    const amt = Number(amount);

    if (kind === "Variable") {
      const delta = type === "income" ? amt : -amt;

      // Optimista y filtrar metas completadas
      setGoals((prev) => {
        const updated = prev.map((g) =>
          g.id === goalId
            ? {
              ...g,
              currentAmount: Math.max(
                0,
                Math.min(g.targetAmount, (g.currentAmount || 0) + delta)
              ),
            }
            : g
        );
        // Filtrar metas completadas automáticamente
        return filterCompletedGoals(updated);
      });

      try {
        await addTransaction(goalId, { type, amount: amt });

        try {
          const detail = await getGoal(goalId);
          const updated = goalApiToUi(detail.data);
          
          // Actualizar la meta y filtrar automáticamente las completadas
          setGoals((arr) => {
            const updatedArr = arr.map((g) => (g.id === goalId ? updated : g));
            // Filtrar metas completadas automáticamente
            return filterCompletedGoals(updatedArr);
          });
        } catch {
          await load(page, { silent: true });
        }

        toast.push({
          tone: "success",
          title: type === "income" ? "Ingreso registrado" : "Gasto registrado",
          message: `${type === "income" ? "+" : "-"}$${amt.toLocaleString()}`,
        });
      } catch (e) {
        // Revertir optimista y filtrar metas completadas
        setGoals((prev) => {
          const reverted = prev.map((g) =>
            g.id === goalId
              ? {
                ...g,
                currentAmount: Math.max(
                  0,
                  Math.min(g.targetAmount, (g.currentAmount || 0) - (type === "income" ? amt : -amt))
                ),
              }
              : g
          );
          // Filtrar metas completadas automáticamente
          return filterCompletedGoals(reverted);
        });
        toast.push({
          tone: "error",
          title: "Error al guardar",
          message: e?.message || "No se pudo registrar el movimiento.",
        });
      }
      return;
    }

    try {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
              ...g,
              currentAmount:
                type === "income"
                  ? Math.min((g.currentAmount || 0) + amt, g.targetAmount)
                  : Math.max((g.currentAmount || 0) - amt, 0),
            }
            : g
        )
      );

      await createRecurringRule({
        goal_id: goalId,
        type,
        amount: amt,
        frequency: frequency || "monthly",
        apply_now: true, 
      });

      toast.push({
        tone: "success",
        title: "Regla fija creada",
        message: `Se aplicó hoy y quedará programada ${frequency === "daily"
          ? "diariamente"
          : frequency === "weekly"
            ? "semanalmente"
            : "mensualmente"
          } por $${amt.toLocaleString()}.`,
      });

      try {
        const detail = await getGoal(goalId);
        const updated = goalApiToUi(detail.data);
        setGoals((arr) => arr.map((g) => (g.id === goalId ? updated : g)));
      } catch {
        await load(page, { silent: true });
      }
    } catch (e) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
              ...g,
              currentAmount:
                type === "income"
                  ? Math.max((g.currentAmount || 0) - amt, 0)
                  : Math.min((g.currentAmount || 0) + amt, g.targetAmount),
            }
            : g
        )
      );
      toast.push({
        tone: "error",
        title: "Error al crear la regla fija",
        message: e?.message || "No se pudo crear la regla.",
      });
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
  return (
    <ToastProvider placement="top-right">
      <GoalsPageInner />
    </ToastProvider>
  );
}
