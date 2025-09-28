import React, { useMemo } from "react";
import ScrollArea from "../ui/ScrollArea";
import { formatYMDToDisplay } from "../../services/dates";

export default function GoalDetailsModal({ open, onClose, goal }) {
    if (!open || !goal) return null;

    const {
        name,
        category,
        description,
        targetAmount = 0,
        currentAmount = 0,
        status = "Activa",
        deadline,  
        createdAt, 
    } = goal;

    const progress = useMemo(() => {
        const p = Math.round(
            (Number(currentAmount) / Math.max(Number(targetAmount), 1)) * 100
        );
        return Math.min(100, Math.max(0, p));
    }, [currentAmount, targetAmount]);

    const remaining = Math.max(0, Number(targetAmount) - Number(currentAmount));

    const statusStyles = {
        Activa:
            "bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/20",
        "En pausa":
            "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/20",
        Completada:
            "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20",
    };
    const badgeCls =
        statusStyles[status] ??
        "bg-gray-500/15 text-gray-600 dark:text-gray-300 ring-1 ring-gray-500/20";

    const deadlineText = deadline
        ? formatYMDToDisplay(deadline, "es-EC")
        : "Sin fecha límite";

    const createdText = createdAt
        ? formatYMDToDisplay(String(createdAt).slice(0, 10), "es-EC")
        : "—";

    let barGradient = "from-indigo-500 to-indigo-600";
    if (progress < 33) barGradient = "from-rose-500 to-rose-600";
    else if (progress < 75) barGradient = "from-amber-400 to-amber-500";

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div
                className="relative z-10 w-full max-w-2xl fin-card p-0 overflow-hidden my-6"
                role="dialog"
                aria-modal="true"
                aria-label="Detalles de la meta"
            >
                {/* Header sticky */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/50">
                    <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-semibold truncate" title={name}>
                            {name}
                        </h3>
                        <div className="mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${badgeCls}`}>{status}</span>
                        </div>
                    </div>
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-current/70" fill="none">
                            <path d="M6 6l12 12M18 6l-12 12" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Contenido con scroll propio */}
                <ScrollArea className="px-5 pt-4 pb-5 space-y-5" maxHeight="75vh">
                    {/* Resumen en 2 columnas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="fin-card p-4">
                            <h4 className="text-sm font-semibold mb-2">Información</h4>
                            <dl className="text-sm space-y-1">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Categoría</dt>
                                    <dd className="text-right">{category || "—"}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Fecha límite</dt>
                                    <dd className="text-right">{deadlineText}</dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Creada</dt>
                                    <dd className="text-right">{createdText}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="fin-card p-4">
                            <h4 className="text-sm font-semibold mb-2">Montos</h4>
                            <dl className="text-sm space-y-1">
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Objetivo</dt>
                                    <dd className="text-right">
                                        ${Number(targetAmount).toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Acumulado</dt>
                                    <dd className="text-right">
                                        ${Number(currentAmount).toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-gray-500 dark:text-gray-400">Restante</dt>
                                    <dd className="text-right">
                                        ${Number(remaining).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-3">
                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700/70 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full bg-gradient-to-r ${barGradient}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    {progress}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción (si existe) */}
                    {description ? (
                        <div className="fin-card p-4">
                            <h4 className="text-sm font-semibold mb-2">Descripción</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>
                    ) : null}
                </ScrollArea>
            </div>
        </div>
    );
}
