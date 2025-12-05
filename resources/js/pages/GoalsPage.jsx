import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import GoalGrid from "../components/goals/GoalGrid";
import GoalGridSkeleton from "../components/goals/GoalGridSkeleton";
import NewGoalModal from "../components/goals/NewGoalModal";
import ConfirmModal from "../components/common/ConfirmModal";
import AddTxModal from "../components/goals/AddTxModal";
import Pagination from "../components/ui/Pagination";
import ResponsivePane from "../layouts/ResponsivePane";
import Empty from "../components/ui/Empty";

import { ToastProvider, useToast } from "../components/ui/ToastProvider";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingGoal, setEditingGoal] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [txOpen, setTxOpen] = useState(false);
  const [txGoal, setTxGoal] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const toast = useToast();

  const filterCompletedGoals = (goals) => {
    return goals.filter(goal => {
      const progress = Math.min(
        100,
        Math.round(((goal.currentAmount ?? 0) / Math.max(goal.targetAmount, 1)) * 100)
      );
      return progress < 100;
    });
  };

  useEffect(() => {
    invalidateCache('goals-page');
  }, [invalidateCache]);


  async function load(p = page, { silent = false, forceRefresh = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const cacheKey = `goals-page-${p}`;
      const res = await fetchWithCache(
        cacheKey,
        () => listGoals({ 
          page: p, 
          pageSize,
          filters: {
            estados: ['Activa'] 
          }
        }),
        { forceRefresh }
      );
      
      if (res) {
        const rows = (res.data ?? []).map(goalApiToUi);
        
        const filteredGoals = filterCompletedGoals(rows);
        
        setGoals(filteredGoals);
        setTotal(res.total ?? rows.length);
        
        const lp = res.last_page ?? Math.max(1, Math.ceil((res.total ?? rows.length) / (res.per_page ?? pageSize)));
        setLastPage(lp);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load(page, { silent: false, forceRefresh: false });
  }, [page]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Goals page became visible, refreshing data...');
        invalidateCache('goals-page');
        invalidateCache(`goals-page-${page}`);
        load(page, { silent: false, forceRefresh: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [page, invalidateCache]);

  async function handleCreateGoal(payload) {
    try {
      const resp = await createGoal(goalUiToApi(payload));
      toast.push({ tone: "success", title: "Meta creada" });
      setModalOpen(false);

      invalidateCache('goals-page');
      setPage(1);
      await load(1, { silent: true, forceRefresh: true });
    } catch (e) {
      toast.push({ tone: "error", title: "Error al crear", message: e?.message || "No se pudo crear la meta." });
    }
  }

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
      return filterCompletedGoals(updated);
    });

    try {
      await updateGoal(id, goalUiToApi(rest));
      toast.push({ tone: "success", title: "Cambios guardados" });

      window.dispatchEvent(new CustomEvent('goalUpdated', { 
        detail: { goalId: id } 
      }));

      try {
        const detail = await getGoal(id);
        const updated = goalApiToUi(detail.data);
        setGoals((arr) => {
          const updatedArr = arr.map((g) => (g.id === id ? updated : g));
          return filterCompletedGoals(updatedArr);
        });
      } catch {
        await load(page, { silent: true });
      }
    } catch (e) {
      toast.push({ tone: "error", title: "Error al actualizar", message: e?.message || "No se pudo actualizar la meta." });
      invalidateCache('goals-page');
      await load(page, { silent: true, forceRefresh: true });
    } finally {
      setModalOpen(false);
      setEditingGoal(null);
    }
  }

  function askDelete(id) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (toDeleteId == null) return;

    setGoals((prev) => prev.filter((g) => g.id !== toDeleteId));
    setConfirmOpen(false);

    try {
      await deleteGoal(toDeleteId);
      toast.push({ tone: "success", title: "Meta eliminada" });

      invalidateCache('goals-page');

      const afterDeleteCount = goals.length - 1;
      const pageNowEmpty = afterDeleteCount === 0 && page > 1;
      const nextPage = pageNowEmpty ? page - 1 : page;

      setPage(nextPage); 
      await load(nextPage, { silent: true, forceRefresh: true });
    } catch (e) {
      toast.push({ tone: "error", title: "Error al eliminar", message: e?.message || "No se pudo eliminar la meta." });
      invalidateCache('goals-page');
      await load(page, { silent: true, forceRefresh: true });
    } finally {
      setToDeleteId(null);
    }
  }

  function handleAddTx(goal) {
    setTxGoal(goal);
    setTxOpen(true);
  }

  async function handleSaveTx({ goalId, type, kind, amount, frequency }) {
    const amt = Number(amount);

    if (kind === "Variable") {
      const delta = type === "income" ? amt : -amt;

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
        return filterCompletedGoals(updated);
      });

      try {
        await addTransaction(goalId, { type, amount: amt });
        window.dispatchEvent(new CustomEvent('transactionAdded', { 
          detail: { goalId, type, amount: amt } 
        }));

        try {
          const detail = await getGoal(goalId);
          const updated = goalApiToUi(detail.data);
          
          setGoals((arr) => {
            const updatedArr = arr.map((g) => (g.id === goalId ? updated : g));
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
          <GoalGridSkeleton />
        ) : goals.length === 0 ? (
          <Empty
            variant="goals"
            title="Aún no tienes metas de ahorro"
            subtitle="Crea tu primera meta para comenzar a registrar tu progreso financiero."
            description="Las metas de ahorro te ayudan a organizar tus finanzas, establecer objetivos claros y hacer un seguimiento de tu progreso hacia la independencia financiera."
          />
        ) : (
          <>
            <GoalGrid goals={goals} onAddTx={handleAddTx} onEdit={handleEditGoal} onDelete={askDelete} />

            <Pagination
              page={page}
              totalPages={lastPage}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
              onFirst={() => setPage(1)}
              onLast={() => setPage(lastPage)}
              alwaysShow={true}
              className="justify-center py-3"
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
