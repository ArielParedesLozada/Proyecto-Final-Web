import clsx from "clsx";
export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  className = "",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      role="navigation"
      aria-label="Paginación"
      className={clsx("flex items-center justify-center gap-2 pt-2 pb-1", className)}
    >
      <button
        className="btn btn-ghost cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => canPrev && onPrev?.()}
        disabled={!canPrev}
        aria-disabled={!canPrev}
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <span className="text-sm px-2 py-1 rounded-lg bg-white/70 dark:bg-gray-800/70 select-none">
        Página {page} de {totalPages}
      </span>

      <button
        className="btn btn-ghost cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => canNext && onNext?.()}
        disabled={!canNext}
        aria-disabled={!canNext}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </div>
  );
}
