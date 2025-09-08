export default function GoalCard({
  goal,
  onAddTx,      // callback para "Agregar Ingreso/Gasto"
  onEdit,       // callback para editar
  onDelete,     // callback para eliminar
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
  } = goal;

  const progress = Math.min(
    100,
    Math.round(((currentAmount ?? 0) / Math.max(targetAmount, 1)) * 100)
  );

  return (
    <div className="fin-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {category} • Creada el {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60">
            {status}
          </span>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60"
            onClick={() => onEdit?.(goal)}
            title="Editar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current/70">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/>
            </svg>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60"
            onClick={() => onDelete?.(id)}
            title="Eliminar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-current/70" fill="none">
              <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {description ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      ) : null}

      <div className="space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <span>$</span> Progreso Financiero
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>${currentAmount?.toLocaleString()}</span>
          <span>${targetAmount?.toLocaleString()}</span>
        </div>

        {/* Barra */}
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700/70">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(to right, #6366f1, #4f46e5)", // Indigo 500→600 (match .btn-primary)
            }}
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">{progress}%</div>
      </div>

      <div className="pt-2">
        <button className="btn btn-ghost" onClick={() => onAddTx?.(goal)}>
          Agregar Ingreso/Gasto
        </button>
      </div>
    </div>
  );
}
