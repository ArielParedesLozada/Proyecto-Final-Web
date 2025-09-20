export default function TransactionItem({ item }) {
  const color =
    item.type === "income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl ring-1 ring-gray-200/70 dark:ring-gray-700/50 p-3 bg-white/90 dark:bg-gray-800/80">
      <div className="h-9 w-9 shrink-0 grid place-items-center rounded-lg bg-gray-100 dark:bg-gray-700/60">
        {item.type === "income" ? "↑" : "↓"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{item.title}</p>
          <span className="text-[10px] rounded-md px-2 py-0.5 bg-primary-600/10 text-primary-700 dark:text-primary-100">
            {item.categoryLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(item.date).toLocaleDateString()} • {item.goal}
        </p>
      </div>

      {/* 👇 en móvil mantiene derecha y no fuerza salto raro */}
      <div className={`ml-auto shrink-0 font-semibold text-sm sm:text-base ${color}`}>
        {item.type === "income" ? "+" : "-"}${item.amount.toLocaleString()}
      </div>
    </div>
  );
}
