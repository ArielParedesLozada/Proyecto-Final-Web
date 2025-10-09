export default function StatsFilters({
  start,
  end,
  onChange,
  onClear,
  onDownload,
}) {
  // Validar si las fechas están incompletas (solo inicio o solo fin)
  const isDateRangeIncomplete = (start && !end) || (!start && end);
  
  return (
    <div className="fin-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Fecha inicio
          </label>
          <input
            type="date"
            className="w-full rounded-md bg-white/70 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 px-3 py-2 text-sm"
            value={start || ""}
            onChange={(e) => onChange?.({ start: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Fecha fin
          </label>
          <input
            type="date"
            className="w-full rounded-md bg-white/70 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 px-3 py-2 text-sm"
            value={end || ""}
            onChange={(e) => onChange?.({ end: e.target.value })}
          />
        </div>

        <div className="flex gap-2 md:justify-end">
          <button
            type="button"
            onClick={onClear}
            className="btn btn-primary cursor-pointer shadow-sm"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={isDateRangeIncomplete}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isDateRangeIncomplete
                ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-60"
                : "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
              }`}
            title={isDateRangeIncomplete ? "Selecciona ambas fechas para descargar" : "Descargar PDF"}
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
