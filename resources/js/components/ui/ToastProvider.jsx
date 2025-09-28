import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import clsx from "clsx";

const ToastCtx = createContext(null);

export function ToastProvider({ children, placement = "top-right", duration = 4000 }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (t) => {
            const id = ++idRef.current;
            const toast = { id, title: t.title ?? "", message: t.message ?? "", tone: t.tone ?? "info", duration: t.duration ?? duration };
            setToasts((prev) => [...prev, toast]);
            if (toast.duration > 0) {
                setTimeout(() => remove(id), toast.duration);
            }
        },
        [duration, remove]
    );

    const value = useMemo(() => ({ push, remove }), [push, remove]);

    return (
        <ToastCtx.Provider value={value}>
            {children}
            {/* Container */}
            <div
                className={clsx(
                    "pointer-events-none fixed z-[70] flex gap-2 p-4",
                    placement === "top-right" && "top-0 right-0 flex-col items-end",
                    placement === "top-left" && "top-0 left-0 flex-col items-start",
                    placement === "bottom-right" && "bottom-0 right-0 flex-col items-end",
                    placement === "bottom-left" && "bottom-0 left-0 flex-col items-start"
                )}
                aria-live="polite"
                aria-atomic="true"
            >
                {toasts.map((t) => (
                    <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
                ))}
            </div>
        </ToastCtx.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
    return ctx;
}

function Toast({ toast, onClose }) {
    const tones = {
        success: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30",
        error: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30",
        info: "bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30",
        warning: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30",
    };

    return (
        <div
            className={clsx(
                "pointer-events-auto w-[320px] max-w-[92vw] rounded-xl shadow-lg backdrop-blur fin-card border border-white/10 dark:border-gray-700/40 overflow-hidden",
                "animate-[fadeIn_.18s_ease-out]",
            )}
            role="status"
            aria-live="polite"
        >
            <div className={clsx("px-4 py-3 text-sm flex items-start gap-3", tones[toast.tone] || tones.info)}>
                <div className="flex-1 min-w-0">
                    {toast.title ? <div className="font-semibold truncate">{toast.title}</div> : null}
                    {toast.message ? <div className="text-xs/5 text-white/80 dark:text-gray-300 line-clamp-3">{toast.message}</div> : null}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Cerrar notificación"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" className="stroke-current" fill="none">
                        <path d="M6 6l12 12M18 6l-12 12" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

/* Animación mínima */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px)} to { opacity: 1; transform: translateY(0)} }
`;
if (typeof document !== "undefined") document.head.appendChild(style);
