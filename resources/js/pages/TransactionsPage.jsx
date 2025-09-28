// src/pages/TransactionsByGoalPage.jsx
import { useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import TransactionsKpis from "../components/transactions/TransactionsKpis";
import TransactionItem from "../components/transactions/TransactionItem";
import ScrollArea from "../components/ui/ScrollArea";
import GoalSelect from "../components/goals/GoalSelect";

// ⚠️ Ejemplo de datos (igual estructura que ya usas)
const ALL_ITEMS = [
  { id: 1, type: "income",  category: "fijo",     categoryLabel: "Fijo",     title: "Salario mensual",        goal: "Vacaciones de Verano", amount: 3000, date: "2026-12-31" },
  { id: 2, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
  { id: 3, type: "expense", category: "variable", categoryLabel: "Variable", title: "Transporte",               goal: "Vacaciones de Verano", amount: 120,  date: "2026-01-20" },
  { id: 4, type: "income",  category: "extra",    categoryLabel: "Extra",    title: "Freelance",               goal: "Fondo de Emergencia", amount: 450,  date: "2026-01-21" },
  { id: 5, type: "expense", category: "variable", categoryLabel: "Variable", title: "Comida fuera",             goal: "Vacaciones de Verano", amount: 90,   date: "2026-01-22" },
];

export default function TransactionsByGoalPage() {
  // metas disponibles a partir de los ítems
  const goals = useMemo(
    () => Array.from(new Set(ALL_ITEMS.map(i => i.goal))),
    []
  );
  const [goal, setGoal] = useState(goals[0] ?? "");

  // filtrar por meta
  const items = useMemo(() => ALL_ITEMS.filter(i => i.goal === goal), [goal]);
  const incomes = items.filter(i => i.type === "income");
  const expenses = items.filter(i => i.type === "expense");

  // KPIs de la meta seleccionada
  const totals = useMemo(() => {
    const income = incomes.reduce((a,b) => a + b.amount, 0);
    const expense = expenses.reduce((a,b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [incomes, expenses]);

 const header = (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Ingresos y Gastos por Meta</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Selecciona una meta para ver sus movimientos
      </p>
    </div>

    {/* Select más grande y mejor posicionado */}
    <GoalSelect goals={goals} value={goal} onChange={setGoal} />
  </div>
);


  return (
    <AppLayout header={header}>
      <div className="grid gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
        <TransactionsKpis totals={totals} />

        <ResponsivePane className="xl:min-h-0" toolbar={null} bottomPadding={24} minPx={360}>
          {/* Dos columnas: ingresos (izq) y gastos (der) con scroll independiente */}
          <div className="grid gap-4 md:grid-cols-2 h-full">
            {/* Ingresos */}
            <section className="fin-card p-4 md:p-5 grid grid-rows-[auto_minmax(0,1fr)]">
              <header className="mb-2">
                <h2 className="text-sm font-semibold">Ingresos</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {incomes.length} registro(s)
                </p>
              </header>
              <ScrollArea
                className="space-y-3"
                maxHeight="clamp(320px, 56svh, calc(100svh - 18rem))"
              >
                {incomes.length ? (
                  incomes.map((i) => <TransactionItem key={i.id} item={i} />)
                ) : (
                  <div className="text-sm text-center text-gray-500 py-8">Sin ingresos</div>
                )}
              </ScrollArea>
            </section>

            {/* Gastos */}
            <section className="fin-card p-4 md:p-5 grid grid-rows-[auto_minmax(0,1fr)]">
              <header className="mb-2">
                <h2 className="text-sm font-semibold">Gastos</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {expenses.length} registro(s)
                </p>
              </header>
              <ScrollArea
                className="space-y-3"
                maxHeight="clamp(320px, 56svh, calc(100svh - 18rem))"
              >
                {expenses.length ? (
                  expenses.map((i) => <TransactionItem key={i.id} item={i} />)
                ) : (
                  <div className="text-sm text-center text-gray-500 py-8">Sin gastos</div>
                )}
              </ScrollArea>
            </section>
          </div>
        </ResponsivePane>
      </div>
    </AppLayout>
  );
}
