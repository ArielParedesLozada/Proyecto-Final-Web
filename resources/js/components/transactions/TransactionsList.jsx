import { useMemo, useState } from "react";
import ScrollArea from "../ui/ScrollArea";
import TransactionItem from "./TransactionItem";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "income", label: "Ingresos" },
  { key: "expense", label: "Gastos" },
];

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-xs px-3 py-1.5 rounded-lg transition",
        active
          ? "bg-primary-600 text-white"
          : "bg-white dark:bg-gray-800 ring-1 ring-gray-200/70 dark:ring-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function TransactionsList({ items }) {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter(i => i.type === filter)),
    [items, filter]
  );

  return (
    <div className="fin-card p-4 md:p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold">Historial de Transacciones</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Organizadas por tipo</p>
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <Pill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mt-4 max-h-[56vh]">
        <ScrollArea className="space-y-3">
          {filtered.map(i => <TransactionItem key={i.id} item={i} />)}
          {!filtered.length && (
            <div className="text-sm text-center text-gray-500 py-8">Sin registros</div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
