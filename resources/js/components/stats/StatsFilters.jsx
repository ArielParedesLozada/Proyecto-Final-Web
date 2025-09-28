export default function StatsFilters({
  start,
  end,
  onChange,
  onClear,
  onDownload,
}) {
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
            className="px-3 py-2 rounded-md text-sm font-medium
                       bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            title="Descargar PDF"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
