import StatPro from "../ui/StatPro";

const IconTrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline
      points="3 17 10 10 14 14 21 7"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconTrendDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline
      points="3 7 9 13 13 9 21 17"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBalance = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 17l4-4 3 3 5-6 6 6"
      className="stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
        spark={[12, 13, 15, 16, 17, 18, 19, 20, 21]}
        icon={<IconTrendUp />}   
      />

      <StatPro
        title="Total Gastos"
        value={`$${expense.toLocaleString()}`}
        delta="Este mes"
        deltaLabel=""
        spark={[5, 6, 7, 6, 8, 7, 9, 8, 7]}
        icon={<IconTrendDown />} 
      />

      <StatPro
        title="Balance Neto"
        value={`$${balance.toLocaleString()}`}
        delta="Ingresos - Gastos"
        deltaLabel=""
        positive={balance >= 0}
        spark={[2, 3, 4, 5, 6, 7, 8, 9, 10]}
        icon={<IconBalance />}   
      />
    </section>
  );
}
