import StatPro from "../ui/StatPro";

export default function TransactionsKpis({ totals }) {
  const { income = 0, expense = 0, balance = 0 } = totals ?? {};
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-fr">
      <StatPro
        title="Total Ingresos"
        value={`$${income.toLocaleString()}`}
        delta="Este mes"
        deltaLabel=""
        positive
        spark={[12,13,15,16,17,18,19,20,21]}
        icon={<span className="opacity-70">📈</span>}
      />
      <StatPro
        title="Total Gastos"
        value={`$${expense.toLocaleString()}`}
        delta="Este mes"
        deltaLabel=""
        spark={[5,6,7,6,8,7,9,8,7]}
        icon={<span className="opacity-70">📉</span>}
      />
      <StatPro
        title="Balance Neto"
        value={`$${balance.toLocaleString()}`}
        delta="Ingresos - Gastos"
        deltaLabel=""
        positive={balance >= 0}
        spark={[2,3,4,5,6,7,8,9,10]}
        icon={<span className="opacity-70">💹</span>}
      />
    </section>
  );
}
