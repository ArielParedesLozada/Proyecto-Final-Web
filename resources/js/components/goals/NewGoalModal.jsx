import React, { useEffect, useRef, useState } from "react";

const categories = ["Emergencia", "Salud", "Tecnología", "Vehículo", "Otro"];

export default function NewGoalModal({
  open,
  onClose,
  onSubmit,
  mode = "create",         // "create" | "edit"
  initialGoal = null,
}) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    targetAmount: "",
    deadline: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialGoal) {
      setForm({
        name: initialGoal.name ?? "",
        category: initialGoal.category ?? "",
        description: initialGoal.description ?? "",
        targetAmount:
          initialGoal.targetAmount != null ? String(initialGoal.targetAmount) : "",
        deadline: initialGoal.deadline ?? "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        description: "",
        targetAmount: "",
        deadline: "",
      });
    }

    setErrors({});
    setTimeout(() => dialogRef.current?.querySelector("input")?.focus(), 30);
  }, [open, mode, initialGoal]);

  function isValidFutureOrToday(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= today.getTime();
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ingresa un nombre";
    if (!form.category) e.category = "Selecciona una categoría";
    if (!form.targetAmount || Number(form.targetAmount) <= 0)
      e.targetAmount = "Monto objetivo inválido";
    if (!form.deadline) {
      e.deadline = "Selecciona la fecha límite";
    } else if (!isValidFutureOrToday(form.deadline)) {
      e.deadline = "La fecha debe ser hoy o una fecha futura";
    }
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    const base = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline, // YYYY-MM-DD
    };

    const payload =
      mode === "edit"
        ? { id: initialGoal?.id, status: initialGoal?.status ?? "Activa", ...base }
        : { status: "Activa", ...base };

    onSubmit(payload);
  }

  if (!open) return null;

  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-xl fin-card p-0 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur border-b border-gray-200/60 dark:border-gray-700/50">
          <h3 className="text-base md:text-lg font-semibold">
            {isEdit ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}
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

        <div ref={dialogRef} className="px-5 pt-3 pb-5 max-h-[85vh] overflow-y-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isEdit ? "Actualiza los datos de tu meta." : "Crea una nueva meta de ahorro."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre de la Meta</label>
              <input
                className={`input-base mt-1 ${errors.name ? "input-error" : ""}`}
                placeholder="Ej. Vacaciones de verano"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                className={`input-base mt-1 ${errors.category ? "input-error" : ""}`}
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
              >
                <option value="" disabled>Selecciona una opción</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Descripción (Opcional)</label>
              <textarea
                rows={3}
                className="input-base mt-1 resize-none"
                placeholder="Describe tu meta"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Monto Objetivo ($)</label>
              <input
                type="number"
                min="0"
                className={`input-base mt-1 ${errors.targetAmount ? "input-error" : ""}`}
                placeholder="3000"
                value={form.targetAmount}
                onChange={(e) => setForm((s) => ({ ...s, targetAmount: e.target.value }))}
              />
              {errors.targetAmount && <p className="text-xs text-red-500 mt-1">{errors.targetAmount}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Fecha Límite</label>
              <input
                type="date"
                className={`input-base mt-1 ${errors.deadline ? "input-error" : ""}`}
                value={form.deadline}
                onChange={(e) => setForm((s) => ({ ...s, deadline: e.target.value }))}
                min={new Date().toISOString().slice(0, 10)}
              />
              {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 ">
              <button type="button" className="btn btn-ghost cursor-pointer" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary cursor-pointer">
                {isEdit ? "Guardar cambios" : "Crear Meta"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
