// src/pages/TransactionsPage.jsx
import AppLayout from "../layouts/AppLayout";
import TransactionsKpis from "../components/transactions/TransactionsKpis";
import TransactionsList from "../components/transactions/TransactionsList";
import ResponsivePane from "../layouts/ResponsivePane";

export default function TransactionsPage() {
  const items = [
    { id: 1, type: "income",  category: "fijo",     categoryLabel: "Fijo",     title: "Salario mensual",        goal: "Vacaciones de Verano", amount: 3000, date: "2026-12-31" },
    { id: 2, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
    { id: 3, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
    { id: 4, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
    { id: 5, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
    { id: 6, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
    { id: 7, type: "expense", category: "variable", categoryLabel: "Variable", title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200,  date: "2026-01-19" },
  ];

  const totals = {
    income: items.filter(i => i.type === "income").reduce((a, b) => a + b.amount, 0),
    expense: items.filter(i => i.type === "expense").reduce((a, b) => a + b.amount, 0),
  };
  totals.balance = totals.income - totals.expense;

  const header = (
    <div>
      <h1 className="text-lg md:text-xl font-semibold">Ingresos y Gastos</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Gestiona tus transacciones financieras por meta de ahorro
      </p>
    </div>
  );

  return (
    <AppLayout header={header}>
      {/* Mantiene la base recta con el menú en cualquier zoom */}
      <div className="grid gap-4 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
        <TransactionsKpis totals={totals} />

        {/* Pane que calcula alto disponible en XL */}
        <ResponsivePane
          className="xl:min-h-0"
          toolbar={null}
          bottomPadding={24}
          minPx={320}
        >
          {/* SIN tocar el componente de la lista.
              La grilla de 3 filas asegura la paginación pegada abajo. */}
          <TransactionsList
            items={items}
            pageSize={5}
            className="h-full grid grid-rows-[auto_minmax(0,1fr)_auto]"
          />
        </ResponsivePane>
      </div>
    </AppLayout>
  );
}
