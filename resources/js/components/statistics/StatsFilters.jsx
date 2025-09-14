export const PERIODS = [
  { key: "1m",  label: "Último mes", months: 1 },
  { key: "3m",  label: "Últimos 3 meses", months: 3 },
  { key: "6m",  label: "Últimos 6 meses", months: 6 },
  { key: "12m", label: "Último año", months: 12 },
  { key: "all", label: "Todo el tiempo", months: null },
];

export const GOAL_TYPES = [
  { key: "all",   label: "Todas las metas" },
  { key: "short", label: "Corto plazo" },
  { key: "long",  label: "Largo plazo" },
  { key: "active",label: "Activas" },
  { key: "done",  label: "Completadas" },
];

export default function StatsFilters({ value, onChange, onApply }) {
  const { period = "6m", goalType = "all" } = value ?? {};

  return (
    <section className="fin-card p-4 md:p-5">
      <h2 className="text-sm font-semibold">Filtros</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Personaliza la visualización de tus datos de ahorro
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>🗓️</span>
          <select
            className="input-base text-sm w-48"
            value={period}
            onChange={(e) => onChange?.({ ...value, period: e.target.value })}
          >
            {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>🧭</span>
          <select
            className="input-base text-sm w-48"
            value={goalType}
            onChange={(e) => onChange?.({ ...value, goalType: e.target.value })}
          >
            {GOAL_TYPES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
        </div>

        <button className="btn btn-primary text-sm" onClick={() => onApply?.(value)}>
          Aplicar Filtros
        </button>
      </div>
    </section>
  );
}
