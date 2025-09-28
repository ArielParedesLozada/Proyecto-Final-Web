import { formatYMDToDisplay } from "../../services/dates";

export default function GoalHistoryRow({ goal, onOpen }) {
    const {
        name,
        category,
        status = "Activa",
        currentAmount = 0,
        targetAmount = 1,
        deadline,
    } = goal;

    const progress = Math.min(
        100,
        Math.round((Number(currentAmount) / Math.max(Number(targetAmount), 1)) * 100)
    );

    const normalizedStatus =
        status === "expired" ? "Vencida" : status;

    const visualStatus = progress >= 100 ? "Completada" : normalizedStatus;

    const statusStyles = {
        Activa:
            "bg-green-500/15 text-green-600 dark:text-green-300 ring-1 ring-green-500/20",
        Completada:
            "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20",
        Vencida:
            "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/20",
    };
    const badgeCls =
        statusStyles[visualStatus] ??
        "bg-gray-500/15 text-gray-600 dark:text-gray-300 ring-1 ring-gray-500/20";

    const deadlineText = deadline
        ? formatYMDToDisplay(deadline, "es-EC")
        : "Sin fecha límite";

    let barGradient = "from-indigo-500 to-indigo-600";
    if (progress < 33) barGradient = "from-rose-500 to-rose-600";
    else if (progress < 75) barGradient = "from-amber-400 to-amber-500";

    return (
        <div
            className="fin-card p-4 hover:shadow-lg/40 transition-shadow w-full"
            role="group"
        >
            {/* Grid 3 columnas en md+, apilado en móvil */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                {/* IZQUIERDA */}
                <div className="md:col-span-4 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate" title={name}>
                            {name}
                        </h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${badgeCls}`}>
                            {visualStatus}
                        </span>
                    </div>
                    <p
                        className="text-xs text-gray-500 dark:text-gray-400 truncate"
                        title={`${category ?? "—"} • ${deadline ? `Finaliza el ${deadlineText}` : "Sin fecha límite"
                            }`}
                    >
                        {category ?? "—"} •{" "}
                        {deadline ? `Finaliza el ${deadlineText}` : "Sin fecha límite"}
                    </p>
                </div>

                {/* CENTRO */}
                <div className="md:col-span-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>${Number(currentAmount).toLocaleString()}</span>
                        <span>${Number(targetAmount).toLocaleString()}</span>
                    </div>
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

                {/* DERECHA */}
                <div className="md:col-span-2 flex md:justify-end">
                    <button
                        type="button"
                        className="btn btn-ghost cursor-pointer px-3 py-1.5 self-start md:self-center"
                        onClick={() => onOpen?.(goal)}
                        aria-label="Ver más"
                        title="Ver más"
                    >
                        <span className="hidden sm:inline">Ver más</span>
                        <svg className="sm:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 6l6 6-6 6"
                                className="stroke-current/80"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
