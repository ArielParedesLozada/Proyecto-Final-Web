import { CATEGORIES_UI } from "../../services/adapters";

const ESTADOS_UI = ["Activa", "Completada", "Vencida"];

export const DEFAULT_FILTERS = {
    search: "",
    categoria: "",           
    estados: [],             
    creadaDesde: "",
    venceHasta: "",
    vence7dias: false,       
};

export default function GoalsFilters({ value, onChange, onClear }) {
    const f = value || DEFAULT_FILTERS;

    const toggleEstado = (label) => {
        const active = f.estados.includes(label);
        onChange({
            ...f,
            estados: active ? f.estados.filter((s) => s !== label) : [...f.estados, label],
        });
    };

    return (
        <div className="fin-card p-4 md:p-5 mb-3">
            <div className="flex flex-wrap items-center gap-3">
                {/* Buscar por nombre */}
                <input
                    className="input-base w-64"
                    placeholder="Buscar por nombre…"
                    value={f.search}
                    onChange={(e) => onChange({ ...f, search: e.target.value })}
                />

                {/* Categoría (UI labels) */}
                <select
                    className="input-base w-48"
                    value={f.categoria}
                    onChange={(e) => onChange({ ...f, categoria: e.target.value })}
                >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES_UI.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* Estados (chips multi con UI labels) */}
                <div className="flex flex-wrap items-center gap-2">
                    {ESTADOS_UI.map((label) => {
                        const active = f.estados.includes(label);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => toggleEstado(label)}
                                className={`px-3 py-1.5 rounded-full text-sm ring-1 transition
                  ${active
                                        ? "bg-primary-600 text-white ring-primary-600"
                                        : "text-gray-600 ring-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/40"}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Chip rápido: vence en ≤ 7 días (opcional) */}
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ml-auto">
                    <input
                        type="checkbox"
                        checked={f.vence7dias}
                        onChange={(e) => onChange({ ...f, vence7dias: e.target.checked })}
                        className="checkbox"
                    />
                    Vence en ≤ 7 días
                </label>

                {/* Limpiar */}
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClear}
                    title="Limpiar filtros"
                >
                    Limpiar
                </button>
            </div>

            {/* Solo dos fechas: Creada desde / Vence hasta */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                    <span className="block text-xs text-gray-500">Creada desde</span>
                    <input
                        type="date"
                        className="input-base"
                        value={f.creadaDesde}
                        onChange={(e) => onChange({ ...f, creadaDesde: e.target.value })}
                        placeholder="dd/mm/aaaa"
                    />
                </label>

                <label className="block">
                    <span className="block text-xs text-gray-500">Vence hasta</span>
                    <input
                        type="date"
                        className="input-base"
                        value={f.venceHasta}
                        onChange={(e) => onChange({ ...f, venceHasta: e.target.value })}
                        placeholder="dd/mm/aaaa"
                    />
                </label>
            </div>
        </div>
    );
}
