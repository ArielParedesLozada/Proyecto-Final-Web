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
            {/* Primera fila: Búsqueda y Categorías */}
            <div className="flex items-center gap-3 mb-3">
                <input
                    className="input-base w-52"
                    placeholder="Buscar por nombre…"
                    value={f.search}
                    onChange={(e) => onChange({ ...f, search: e.target.value })}
                />

                <select
                    className="input-base w-44"
                    value={f.categoria}
                    onChange={(e) => onChange({ ...f, categoria: e.target.value })}
                >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES_UI.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Segunda fila: Estados, Fechas, Checkbox y Botón */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
                    {ESTADOS_UI.map((label) => {
                        const active = f.estados.includes(label);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => toggleEstado(label)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${active
                                        ? "bg-primary-600 text-white border-primary-600"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/40"}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Desde:</span>
                    <input
                        type="date"
                        className="input-base w-36"
                        value={f.creadaDesde}
                        onChange={(e) => onChange({ ...f, creadaDesde: e.target.value })}
                        title="Creada desde"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Hasta:</span>
                    <input
                        type="date"
                        className="input-base w-36"
                        value={f.venceHasta}
                        onChange={(e) => onChange({ ...f, venceHasta: e.target.value })}
                        title="Vence hasta"
                    />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        checked={f.vence7dias}
                        onChange={(e) => onChange({ ...f, vence7dias: e.target.checked })}
                        className="checkbox"
                    />
                    Vence en ≤ 7 días
                </label>

                <button
                    type="button"
                    className="btn btn-primary cursor-pointer shadow-sm ml-auto"
                    onClick={onClear}
                    title="Limpiar filtros"
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}
