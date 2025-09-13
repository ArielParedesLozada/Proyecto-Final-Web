export default function GoalCard({
  goal,
  onAddTx,
  onEdit,
  onDelete,
}) {
  const {
    id,
    name,
    category,
    description,
    targetAmount,
    currentAmount,
    status = "Activa",
    createdAt,
    deadline,
  } = goal;

  const progress = Math.min(
    100,
    Math.round(((currentAmount ?? 0) / Math.max(targetAmount, 1)) * 100)
  );

  // Fecha límite
  const deadlineText = deadline
    ? new Date(deadline).toLocaleDateString()
    : "Sin fecha límite";

  // Colores por estado (badge)
  const statusStyles = {
    Activa:
      "bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/20",
    "En pausa":
      "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20",
    Completada:
      "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20",
  };
  const badgeCls =
    statusStyles[status] ??
    "bg-gray-500/15 text-gray-600 dark:text-gray-300 ring-1 ring-gray-500/20";

  // Colores dinámicos de la BARRA según porcentaje
  let barGradient = "from-indigo-500 to-indigo-600"; 
  if (progress < 33) {
    barGradient = "from-rose-500 to-rose-600";       
  } else if (progress < 75) {
    barGradient = "from-amber-400 to-amber-500";     
  }

  return (
    <div className="fin-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        {/* Texto (truncado a una línea) */}
        <div className="min-w-0">
          <h3
            className="font-semibold truncate whitespace-nowrap overflow-hidden"
            title={name}
          >
            {name}
          </h3>
          <p
            className="text-sm text-gray-500 dark:text-gray-400 truncate whitespace-nowrap overflow-hidden"
            title={`${category} • ${deadline ? `Finaliza el ${deadlineText}` : "Sin fecha límite"}`}
          >
            {category} • {deadline ? `Finaliza el ${deadlineText}` : "Sin fecha límite"}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full ${badgeCls}`}>
            {status}
          </span>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
            onClick={() => onEdit?.(goal)}
            title="Editar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current/70">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />
            </svg>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
            onClick={() => onDelete?.(id)}
            title="Eliminar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-current/70" fill="none">
              <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {description ? (
        <p
          className="text-sm text-gray-600 dark:text-gray-300 truncate whitespace-nowrap overflow-hidden"
          title={description}
        >
          {description}
        </p>
      ) : null}

      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <span>$</span> Progreso Financiero
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>${currentAmount?.toLocaleString()}</span>
          <span>${targetAmount?.toLocaleString()}</span>
        </div>

        {/* Barra con color dinámico */}
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700/70 overflow-hidden">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${barGradient}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">{progress}%</div>
      </div>

      <div className="pt-2">
        <button className="btn btn-ghost cursor-pointer" onClick={() => onAddTx?.(goal)}>
          Agregar Ingreso/Gasto
        </button>
      </div>
    </div>
  );
}
