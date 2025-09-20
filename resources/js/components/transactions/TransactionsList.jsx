// src/components/transactions/TransactionsList.jsx
import { useEffect, useMemo, useState } from "react";
import ScrollArea from "../ui/ScrollArea";
import TransactionItem from "./TransactionItem";
import Pagination from "../ui/Pagination";

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

export default function TransactionsList({ items = [], pageSize = 6, className = "" }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  useEffect(() => { setPage(1); }, [filter, items]);

  return (
    <div className={["fin-card overflow-hidden p-4 md:p-5", className].join(" ")}>
      {/* Header sticky 100% transparente (sin fondo ni blur) */}
      <div
        className={[
          "sticky top-0 z-10",
          "px-0 pt-1 pb-3",
          "bg-transparent",      // ← antes: bg-white/90 dark:bg-gray-800/70 backdrop-blur
        ].join(" ")}
      >
        <div className="grid items-center gap-2 md:grid-cols-[1fr,auto] px-0">
          <div className="px-0">
            <h2 className="text-sm font-semibold">Historial de Transacciones</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Organizadas por tipo</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {FILTERS.map((f) => (
              <Pill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea
        className="space-y-3"
        maxHeight="clamp(320px, 56svh, calc(100svh - 18rem))"
      >
        {pageItems.map((i, idx) => (
          <TransactionItem key={i.id ?? `${i.title}-${idx}`} item={i} />
        ))}

        {!pageItems.length && (
          <div className="text-sm text-center text-gray-500 py-8">Sin registros</div>
        )}
      </ScrollArea>

      <Pagination
        className="mt-2"
        page={safePage}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
