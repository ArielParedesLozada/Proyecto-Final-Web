import clsx from "clsx";

export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onFirst,
  onLast,
  className = "",
  alwaysShow = false,
}) {
  // Mostrar siempre si alwaysShow es true, o si hay más de una página
  if (!alwaysShow && (!totalPages || totalPages <= 1)) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const canFirst = page > 1;
  const canLast = page < totalPages;

  return (
    <div className={clsx("w-full", className)}>
      {/* Layout horizontal: texto a la izquierda, botones a la derecha */}
      <div className="flex items-center justify-between">
        {/* Texto informativo a la izquierda */}
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Página {page} de {Math.max(1, totalPages)}
          </span>
        </div>

        {/* Controles de paginación a la derecha */}
        <div
          role="navigation"
          aria-label="Paginación"
          className="flex items-center gap-1"
        >
        {/* Botón Primera página */}
        <button
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
            canFirst
              ? "text-gray-700 dark:text-gray-300 cursor-pointer"
              : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
          )}
          onClick={() => canFirst && onFirst?.()}
          disabled={!canFirst}
          aria-disabled={!canFirst}
          aria-label="Primera página"
        >
          «
        </button>

        {/* Botón Anterior */}
        <button
          className={clsx(
            "flex items-center justify-center px-3 h-8 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
            canPrev
              ? "text-gray-700 dark:text-gray-300 cursor-pointer"
              : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
          )}
          onClick={() => canPrev && onPrev?.()}
          disabled={!canPrev}
          aria-disabled={!canPrev}
          aria-label="Página anterior"
        >
          Anterior
        </button>

        {/* Número de página actual */}
        <div className="flex items-center justify-center min-w-[2.5rem] h-8 mx-2">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
            {page}
          </span>
        </div>

        {/* Botón Siguiente */}
        <button
          className={clsx(
            "flex items-center justify-center px-3 h-8 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
            canNext
              ? "text-gray-700 dark:text-gray-300 cursor-pointer"
              : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
          )}
          onClick={() => canNext && onNext?.()}
          disabled={!canNext}
          aria-disabled={!canNext}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>

        {/* Botón Última página */}
        <button
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-gray-200 dark:border-gray-700",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
            canLast
              ? "text-gray-700 dark:text-gray-300 cursor-pointer"
              : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
          )}
          onClick={() => canLast && onLast?.()}
          disabled={!canLast}
          aria-disabled={!canLast}
          aria-label="Última página"
        >
          »
        </button>
        </div>
      </div>
    </div>
  );
}
