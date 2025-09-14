import AppLayout from "../layouts/AppLayout";
import TransactionsKpis from "../components/transactions/TransactionsKpis";
import TransactionsList from "../components/transactions/TransactionsList";

export default function TransactionsPage() {
  // Demo data (luego lo cableamos a tu API)
  const items = [
    {
      id: 1, type: "income", category: "fijo", categoryLabel: "Fijo",
      title: "Salario mensual", goal: "Vacaciones de Verano", amount: 3000, date: "2026-12-31",
    },
    {
      id: 2, type: "expense", category: "variable", categoryLabel: "Variable",
      title: "Compras del supermercado", goal: "Fondo de Emergencia", amount: 200, date: "2026-01-19",
    },
  ];

  const totals = {
    income: items.filter(i => i.type === "income").reduce((a,b)=>a+b.amount,0),
    expense: items.filter(i => i.type === "expense").reduce((a,b)=>a+b.amount,0),
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
      <TransactionsKpis totals={totals} />
      <div className="mt-4">
        <TransactionsList items={items} />
      </div>
    </AppLayout>
  );
}
