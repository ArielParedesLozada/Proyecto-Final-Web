import React, { useState, useEffect, useRef } from "react";
import AppLayout from "../layouts/AppLayout";
import ResponsivePane from "../layouts/ResponsivePane";
import ScrollArea from "../components/ui/ScrollArea";
import Pagination from "../components/ui/Pagination";
import Empty from "../components/ui/Empty";
import GoalHistoryRow from "../components/history/GoalHistoryRow";
import GoalDetailsModal from "../components/history/GoalDetailsModal";
import GoalsFilters, { DEFAULT_FILTERS } from "../components/history/GoalsFilters";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { listGoals, getGoal } from "../services/goals";
import { goalApiToUi } from "../services/adapters";
import { useToast, ToastProvider } from "../components/ui/ToastProvider";

const LS_KEY = "fs_history_filters";

function HistoryPageInner() {
    const toast = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // paginación
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const [lastPage, setLastPage] = useState(1);

    // filtros
    const [filters, setFilters] = useState(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS;
        } catch {
            return DEFAULT_FILTERS;
        }
    });

    const debouncedSearch = useDebouncedValue(filters.search, 300);

    // modal detalle
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailGoal, setDetailGoal] = useState(null);

    const firstLoadRef = useRef(true);

    /** Construye filtros efectivos para API (omite rango si está incompleto o inválido) */
    function buildEffectiveFilters() {
        const f = { ...filters, search: debouncedSearch };

        const hasStart = !!f.creadaDesde;
        const hasEnd = !!f.venceHasta;

        if (hasStart && hasEnd) {
            if (f.venceHasta >= f.creadaDesde) return f; // rango válido
            const { creadaDesde, venceHasta, ...rest } = f;
            return rest; // rango inválido → se omite
        }

        const { creadaDesde, venceHasta, ...rest } = f;
        return rest;
    }

    async function load(p = page, { silent = false } = {}) {
        if (!silent) setLoading(true);
        try {
            const effective = buildEffectiveFilters();
            const res = await listGoals({
                page: p,
                pageSize,
                filters: effective,
            });

            const rows = (res.data ?? []).map(goalApiToUi);
            setItems(rows);

            const lp =
                res.last_page ??
                Math.max(1, Math.ceil((res.total ?? rows.length) / (res.per_page ?? pageSize)));
            setLastPage(lp);
        } finally {
            if (!silent) setLoading(false);
        }
    }

    // persistir filtros
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(filters));
    }, [filters]);

    // primera carga y cambios de búsqueda (debounced)
    useEffect(() => {
        const silent = !firstLoadRef.current;
        load(page, { silent }).finally(() => {
            firstLoadRef.current = false;
        });
    }, [page, debouncedSearch]);

    useEffect(() => {
        setPage(1);
        load(1, { silent: false });
    }, [filters.categoria, filters.estados, filters.vence7dias]);

    useEffect(() => {
        const start = filters.creadaDesde;
        const end = filters.venceHasta;

        const bothEmpty = !start && !end;
        const bothValid = !!start && !!end && end >= start;

        if (bothEmpty || bothValid) {
            setPage(1);
            load(1, { silent: false });
        }
    }, [filters.creadaDesde, filters.venceHasta]);

    // toasts informativos/errores por fechas
    const lastDateStateRef = useRef("init");
    useEffect(() => {
        const start = filters.creadaDesde;
        const end = filters.venceHasta;

        let state = "none";
        if (start && !end) state = "start-only";
        else if (!start && end) state = "end-only";
        else if (start && end && end < start) state = "invalid";
        else if (start && end) state = "ok";

        if (state === lastDateStateRef.current) return;
        lastDateStateRef.current = state;

        if (state === "start-only") {
            toast.push({
                tone: "info",
                title: "Rango incompleto",
                message: 'Selecciona "Vence hasta" para aplicar el rango.',
            });
        } else if (state === "end-only") {
            toast.push({
                tone: "info",
                title: "Rango incompleto",
                message: 'Selecciona "Creada desde" para aplicar el rango.',
            });
        } else if (state === "invalid") {
            toast.push({
                tone: "error",
                title: "Rango inválido",
                message: "La fecha de vencimiento no puede ser anterior a la fecha de inicio.",
            });
        }
    }, [filters.creadaDesde, filters.venceHasta, toast]);

    async function openDetails(goal) {
        try {
            const detail = await getGoal(goal.id);
            setDetailGoal(goalApiToUi(detail.data));
        } catch {
            setDetailGoal(goal);
        } finally {
            setDetailOpen(true);
        }
    }

    const header = (
        <div>
            <h1 className="text-lg md:text-xl font-semibold">Historial</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Consulta y revisa el registro de tus metas de ahorro
            </p>
        </div>
    );

    return (
        <AppLayout header={header}>
            <ResponsivePane>
                {/* Filtros */}
                <GoalsFilters
                    value={filters}
                    onChange={(v) => setFilters(v)}
                    onClear={() => {
                        setFilters(DEFAULT_FILTERS);
                        toast.push({
                            tone: "success",
                            title: "Filtros limpiados",
                            message: "Se restablecieron todos los filtros.",
                        });
                    }}
                />

                <ScrollArea className="space-y-3">
                    {loading ? (
                        <div className="fin-card p-6 text-sm text-gray-500 dark:text-gray-400">
                            Cargando…
                        </div>
                    ) : items.length === 0 ? (
                        <Empty
                            title="Sin resultados"
                            subtitle="No encontramos metas con los filtros aplicados."
                            actions={
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setFilters(DEFAULT_FILTERS);
                                        toast.push({
                                            tone: "success",
                                            title: "Filtros limpiados",
                                            message: "Se restablecieron todos los filtros.",
                                        });
                                    }}
                                >
                                    Limpiar filtros
                                </button>
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {items.map((g) => (
                                    <GoalHistoryRow key={g.id} goal={g} onOpen={openDetails} />
                                ))}
                            </div>

                            <Pagination
                                page={page}
                                totalPages={lastPage}
                                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                                onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
                                className="justify-center py-2"
                            />
                        </>
                    )}
                </ScrollArea>
            </ResponsivePane>

            {/* Modal de detalles */}
            <GoalDetailsModal
                open={detailOpen}
                goal={detailGoal}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailGoal(null);
                }}
            />
        </AppLayout>
    );
}

export default function HistoryPage() {
    return (
        <ToastProvider placement="top-right">
            <HistoryPageInner />
        </ToastProvider>
    );
}
