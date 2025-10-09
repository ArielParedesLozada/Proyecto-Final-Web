import { useEffect, useRef, useState } from "react";
import {
    listRecurringRules,
    updateRecurringRule,
    deleteRecurringRule,
} from "../../services/transactions";
import ConfirmModal from "../common/ConfirmModal";
import ScrollArea from "../ui/ScrollArea";

const FREQUENCIES = [
    { value: "monthly", label: "Mensual" },
    { value: "weekly", label: "Semanal" },
    { value: "daily", label: "Diaria" },
];

export default function AddTxModal({
    open,
    onClose,
    goal,       // { id, name, targetAmount, currentAmount, ... }
    onSubmit,   // (payload) => void | Promise<void>
}) {
    const dialogRef = useRef(null);

    const [type, setType] = useState("");           // "income" | "expense"
    const [kind, setKind] = useState("");           // "Fijo" | "Variable"
    const [frequency, setFrequency] = useState("monthly");
    const [amount, setAmount] = useState("");
    const [errors, setErrors] = useState({});

    // Regla existente -> bloqueo
    const [lockedFixed, setLockedFixed] = useState(false);
    const [lockedInfo, setLockedInfo] = useState(null); // { id, frequency, amount, type }

    // UI edición/eliminación de la regla fija
    const [editRuleOpen, setEditRuleOpen] = useState(false);
    const [editRuleAmount, setEditRuleAmount] = useState("");
    const [editRuleFreq, setEditRuleFreq] = useState("monthly");
    const [savingRule, setSavingRule] = useState(false);

    // Confirmación eliminar
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deletingRule, setDeletingRule] = useState(false);

    // Saldos
    const target = Number(goal?.targetAmount ?? 0);
    const current = Math.max(0, Number(goal?.currentAmount ?? 0));

    // Reset al abrir
    useEffect(() => {
        if (!open) return;
        setType("");
        setKind("");
        setFrequency("monthly");
        setAmount("");
        setErrors({});
        setLockedFixed(false);
        setLockedInfo(null);
        setEditRuleOpen(false);
        setSavingRule(false);
        setDeletingRule(false);
        setConfirmDeleteOpen(false);
        setTimeout(() => dialogRef.current?.querySelector("button[data-kind=income]")?.focus(), 30);
    }, [open]);

    // Elegir Ingreso/Gasto y verificar regla fija existente
    async function setTypeAndDefaultKind(nextType) {
        setType(nextType);
        if (!kind) setKind("Variable");

        try {
            if (!goal?.id) return;
            const res = await listRecurringRules(goal.id, { type: nextType });
            const rule = Array.isArray(res?.data) ? res.data[0] : null;

            if (rule) {
                setLockedFixed(true);
                const amt = Number(rule.amount ?? 0);
                const freq = rule.frequency || "monthly";
                setLockedInfo({ id: rule.id, frequency: freq, amount: amt, type: rule.type });

                // Forzar UI a Fijo + precargar campos
                setKind("Fijo");
                setFrequency(freq);
                setAmount(String(amt));               // monto visible pero read-only
                setEditRuleAmount(String(amt));
                setEditRuleFreq(freq);
            } else {
                // No hay regla -> libre
                setLockedFixed(false);
                setLockedInfo(null);
                setEditRuleOpen(false);
                if (!kind) setKind("Variable");
                setAmount("");
            }
        } catch {
            setLockedFixed(false);
            setLockedInfo(null);
            setEditRuleOpen(false);
        }
    }

    function validate() {
        const e = {};
        const nAmount = Number(amount);

        if (!type) e.type = "Selecciona Ingreso o Gasto";
        if (!kind && !lockedFixed) e.kind = "Selecciona el tipo (Fijo/Variable)";

        if (!lockedFixed) {
            if (!amount || nAmount <= 0) e.amount = "Monto inválido";
            if (!e.amount && type === "expense" && nAmount > current) {
                e.amount = `El gasto excede tu saldo disponible ($${current.toLocaleString()}).`;
            }
        }

        if ((kind === "Fijo" || lockedFixed) && !frequency) {
            e.frequency = "Selecciona una frecuencia";
        }
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;

        // Si hay regla fija lockeada, ya no permitimos registrar nada.
        if (lockedFixed) {
            // No debería renderizarse el botón Guardar; este guard es por seguridad.
            return;
        }

        await onSubmit?.({
            goalId: goal?.id,
            type,
            kind, // "Fijo" | "Variable"
            amount: Number(amount),
            frequency,
        });
        onClose?.();
    }

    // Guardar cambios a la **regla** fija (no afecta saldo inmediato)
    async function handleUpdateRule() {
        if (!lockedInfo?.id) return;
        const nAmt = Number(editRuleAmount || 0);
        if (!nAmt || nAmt <= 0) return;

        setSavingRule(true);
        try {
            await updateRecurringRule(lockedInfo.id, {
                amount: nAmt,
                frequency: editRuleFreq,
                reseed_next_run: true,
            });
            // Actualizar UI
            setLockedInfo((s) => s && ({ ...s, amount: nAmt, frequency: editRuleFreq }));
            setFrequency(editRuleFreq);
            setAmount(String(nAmt)); // seguir mostrando el monto actual de la regla
            setEditRuleOpen(false);
        } finally {
            setSavingRule(false);
        }
    }

    // Confirmar y eliminar **regla** fija
    async function doDeleteRule() {
        if (!lockedInfo?.id) return;
        setDeletingRule(true);
        try {
            await deleteRecurringRule(lockedInfo.id);

            // Limpiar todo lo relacionado a la regla para que NO haya que hacer 2 clics
            setConfirmDeleteOpen(false);
            setLockedFixed(false);
            setLockedInfo(null);
            setEditRuleOpen(false);

            // Volver a Variable por defecto
            setKind("Variable");
            setFrequency("monthly");
            setAmount("");
            setErrors((e) => ({ ...e, frequency: undefined }));
        } finally {
            setDeletingRule(false);
        }
    }

    if (!open) return null;

    const isIncome = type === "income";
    const isExpense = type === "expense";
    const disabledInputs = !type;
    const disabledCls = disabledInputs ? "opacity-70 cursor-not-allowed" : "";

    const nAmount = Number(amount || 0);
    const expenseTooHigh = isExpense && nAmount > 0 && nAmount > current;

    // Solo permitimos enviar cuando NO hay regla fija bloqueada
    const canSubmit =
        !!type &&
        !lockedFixed &&
        !!kind &&
        nAmount > 0 &&
        !(isExpense && expenseTooHigh) &&
        !(kind === "Fijo" && !frequency);

    const frequencyLabel =
        FREQUENCIES.find((f) => f.value === (lockedInfo?.frequency || frequency))?.label
        || lockedInfo?.frequency || frequency;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md fin-card p-0 overflow-hidden" role="dialog" aria-modal="true">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/50">
                    <h3 className="text-base md:text-lg font-semibold">
                        Agregar {isIncome ? "Ingreso" : isExpense ? "Gasto" : "Ingreso/Gasto"}
                    </h3>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer" onClick={onClose} aria-label="Cerrar">
                        <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-current/70" fill="none">
                            <path d="M6 6l12 12M18 6l-12 12" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <ScrollArea className="max-h-[80vh]">
                    <div ref={dialogRef} className="px-5 pt-4 pb-5">
                    {goal?.name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate whitespace-nowrap overflow-hidden">
                            Meta: <span className="font-medium text-gray-700 dark:text-gray-200" title={goal.name}>{goal.name}</span>
                        </p>
                    )}

                    {/* Selector tipo Ingreso/Gasto */}
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            data-kind="income"
                            onClick={() => setTypeAndDefaultKind("income")}
                            className={["flex-1 btn", isIncome ? "btn-primary" : "btn-ghost", "cursor-pointer"].join(" ")}
                        >
                            Ingreso
                        </button>
                        <button
                            type="button"
                            data-kind="expense"
                            onClick={() => setTypeAndDefaultKind("expense")}
                            className={["flex-1 btn", isExpense ? "bg-rose-600 text-white hover:opacity-90" : "btn-ghost", "cursor-pointer"].join(" ")}
                        >
                            Gasto
                        </button>
                    </div>
                    {errors.type && <p className="text-xs text-red-500 -mt-2 mb-2">{errors.type}</p>}

                    {type && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Saldo disponible: <span className="font-medium">${current.toLocaleString()}</span> | Objetivo: ${target.toLocaleString()}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tipo Fijo / Variable */}
                        <div>
                            <label className="text-sm font-medium">Tipo</label>

                            {lockedFixed ? (
                                <>
                                <br />
                                    <div className="mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/20">
                                        Ya existe una regla fija para este {type === "income" ? "ingreso" : "gasto"} • {frequencyLabel} • Monto: ${Number(lockedInfo?.amount || 0).toLocaleString()}
                                    </div>

                                    {!editRuleOpen ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <button type="button" className="btn btn-ghost cursor-pointer" onClick={() => setEditRuleOpen(true)}>
                                                Editar regla fija
                                            </button>
                                            <button
                                                type="button"
                                                className="btn bg-rose-600 text-white hover:opacity-90 cursor-pointer disabled:opacity-60"
                                                onClick={() => setConfirmDeleteOpen(true)}
                                            >
                                                Eliminar regla
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-2 p-3 rounded-lg ring-1 ring-gray-200/60 dark:ring-gray-700/60 space-y-3">
                                            <div>
                                                <label className="text-sm font-medium">Frecuencia</label>
                                                <select className="input-base mt-1" value={editRuleFreq} onChange={(e) => setEditRuleFreq(e.target.value)}>
                                                    {FREQUENCIES.map((f) => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Monto de la regla</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="input-base mt-1"
                                                    value={editRuleAmount}
                                                    onChange={(e) => setEditRuleAmount(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary cursor-pointer disabled:opacity-60"
                                                    onClick={handleUpdateRule}
                                                    disabled={savingRule}
                                                >
                                                    {savingRule ? "Guardando…" : "Guardar cambios"}
                                                </button>
                                                <button type="button" className="btn btn-ghost cursor-pointer" onClick={() => setEditRuleOpen(false)}>
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                        El tipo queda bloqueado como <b>Fijo</b> mientras exista esta regla.
                                    </p>
                                </>
                            ) : (
                                <div className={`mt-1 flex rounded-lg ring-1 ring-gray-200/60 dark:ring-gray-700/60 overflow-hidden ${disabledInputs ? "opacity-70" : ""}`}>
                                    <button
                                        type="button"
                                        disabled={disabledInputs}
                                        onClick={() => setKind("Variable")}
                                        className={`px-3 py-1.5 flex-1 cursor-pointer ${kind === "Variable" ? "bg-gray-100 dark:bg-gray-700/50 font-medium" : "bg-transparent"}`}
                                    >
                                        Variable (por defecto)
                                    </button>
                                    <button
                                        type="button"
                                        disabled={disabledInputs}
                                        onClick={() => setKind("Fijo")}
                                        className={`px-3 py-1.5 flex-1 cursor-pointer ${kind === "Fijo" ? "bg-gray-100 dark:bg-gray-700/50 font-medium" : "bg-transparent"}`}
                                    >
                                        Fijo (crea regla)
                                    </button>
                                </div>
                            )}

                            {errors.kind && !lockedFixed && <p className="text-xs text-red-500 mt-1">{errors.kind}</p>}
                            {!lockedFixed && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    Si eliges <b>Fijo</b>, se programará automáticamente según la frecuencia.
                                    Luego no se podrá cambiar entre fijo/variable; solo editar monto o eliminar.
                                </p>
                            )}
                        </div>

                        {/* Frecuencia (si Fijo) - Solo mostrar si NO se está editando una regla fija */}
                        {(kind === "Fijo" || lockedFixed) && !editRuleOpen && (
                            <div>
                                <label className="text-sm font-medium">Frecuencia</label>
                                <select
                                    disabled={disabledInputs || lockedFixed}
                                    className={`input-base mt-1 ${errors.frequency ? "input-error" : ""} ${
                                        (disabledInputs || lockedFixed) 
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                                            : ""
                                    }`}
                                    value={lockedFixed ? (lockedInfo?.frequency || frequency) : frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                >
                                    {FREQUENCIES.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                {errors.frequency && !lockedFixed && <p className="text-xs text-red-500 mt-1">{errors.frequency}</p>}
                            </div>
                        )}

                        {/* Monto - Solo mostrar si NO se está editando una regla fija */}
                        {!editRuleOpen && (
                            <div>
                                <label className="text-sm font-medium">
                                    Monto {isIncome ? "(+)" : isExpense ? "(-)" : ""}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    disabled={disabledInputs || lockedFixed}
                                    className={`input-base mt-1 ${errors.amount ? "input-error" : ""} ${
                                        (disabledInputs || lockedFixed) 
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                                            : ""
                                    }`}
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                {(errors.amount || expenseTooHigh) && !lockedFixed && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.amount || `El gasto excede tu saldo disponible ($${current.toLocaleString()}).`}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Botón Guardar: se oculta completamente cuando hay regla fija */}
                        {!lockedFixed && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={!canSubmit}
                                >
                                    Guardar
                                </button>
                            </div>
                        )}
                    </form>
                    </div>
                </ScrollArea>
            </div>

            {/* Confirmación elegante para eliminar regla */}
            <ConfirmModal
                open={confirmDeleteOpen}
                title="Eliminar regla fija"
                message="¿Seguro que deseas eliminar esta regla fija? Esta acción no se puede deshacer."
                confirmText={deletingRule ? "Eliminando…" : "Sí, eliminar"}
                cancelText="Cancelar"
                onConfirm={doDeleteRule}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
        </div>
    );
}
