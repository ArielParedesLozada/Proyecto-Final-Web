export default function StatsFilters({ onApply }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60">
        Todo el tiempo
      </button>
      <button className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60">
        Todas las metas
      </button>

      <div className="ms-auto flex gap-2">
        <button className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60">
          Filtros
        </button>
        <button
          onClick={onApply}
          className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}
