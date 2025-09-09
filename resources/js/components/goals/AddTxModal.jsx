import { useEffect, useRef, useState } from "react";

export default function AddTxModal({
  open,
  onClose,
  goal,                 // { id, name, ... } (opcional para mostrar el título)
  onSubmit,             // (payload) => void | Promise<void>
}) {
  const dialogRef = useRef(null);
  const [type, setType] = useState("");               // "income" | "expense"
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setType("");
    setAmount("");
    setDate(new Date().toISOString().slice(0, 10));
    setNote("");
    setErrors({});
    setTimeout(() => dialogRef.current?.querySelector("button[data-kind=income]")?.focus(), 30);
  }, [open]);

  function validate() {
    const e = {};
    if (!type) e.type = "Selecciona Ingreso o Gasto";
    if (!amount || Number(amount) <= 0) e.amount = "Monto inválido";
    if (!date) e.date = "Selecciona la fecha";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // entregamos el payload con signo POSITIVO y el tipo aparte
    await onSubmit?.({
      goalId: goal?.id,
      type,                                // "income" | "expense"
      amount: Number(amount),
      date,                                // YYYY-MM-DD
      note: note.trim() || null,
    });
    onClose?.();
  }

  if (!open) return null;

  const isIncome = type === "income";
  const isExpense = type === "expense";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md fin-card p-0 overflow-hidden" role="dialog" aria-modal="true">
        {/* header sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/50">
          <h3 className="text-base md:text-lg font-semibold">
            Agregar {type === "income" ? "Ingreso" : type === "expense" ? "Gasto" : "Ingreso/Gasto"}
          </h3>
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

        {/* body */}
        <div ref={dialogRef} className="px-5 pt-4 pb-5 max-h-[80vh] overflow-y-auto">
          {goal?.name && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Meta: <span className="font-medium text-gray-700 dark:text-gray-200">{goal.name}</span>
            </p>
          )}

          {/* selector tipo: segment control */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              data-kind="income"
              onClick={() => setType("income")}
              className={[
                "flex-1 btn",
                isIncome
                  ? "btn-primary"
                  : "btn-ghost",
                "cursor-pointer",
              ].join(" ")}
            >
              Ingreso
            </button>
            <button
              type="button"
              data-kind="expense"
              onClick={() => setType("expense")}
              className={[
                "flex-1 btn",
                isExpense
                  ? "bg-rose-600 text-white hover:opacity-90"
                  : "btn-ghost",
                "cursor-pointer",
              ].join(" ")}
            >
              Gasto
            </button>
          </div>
          {errors.type && <p className="text-xs text-red-500 -mt-2 mb-2">{errors.type}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* monto */}
            <div>
              <label className="text-sm font-medium">
                Monto {isIncome ? "(+)" : isExpense ? "(-)" : ""}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={!type}
                className={`input-base mt-1 ${errors.amount ? "input-error" : ""} ${!type ? "opacity-70 cursor-not-allowed" : ""}`}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            {/* fecha */}
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <input
                type="date"
                className={`input-base mt-1 ${errors.date ? "input-error" : ""}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}  // típicamente los movimientos no son futuros
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>

            {/* nota */}
            <div>
              <label className="text-sm font-medium">Nota (opcional)</label>
              <input
                className="input-base mt-1"
                placeholder="Descripción breve"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" className="btn btn-ghost cursor-pointer" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!type}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
