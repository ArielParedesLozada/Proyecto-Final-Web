// resources/js/components/goals/NewGoalModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn"; // opcional: si tienes helper. Si no, borra el import.

const categories = [
  "Viaje/Educa",
  "Emergencia",
  "Salud",
  "Tecnología",
  "Vehículo",
  "Otro",
];

export default function NewGoalModal({ open, onClose, onSubmit }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    category: categories[0],
    description: "",
    targetAmount: "",
    type: "Fijo/Variable",
    deadline: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        category: categories[0],
        description: "",
        targetAmount: "",
        type: "Fijo/Variable",
        deadline: "",
      });
      setErrors({});
      // focus en primer input
      setTimeout(() => dialogRef.current?.querySelector("input")?.focus(), 30);
    }
  }, [open]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ingresa un nombre";
    if (!form.targetAmount || Number(form.targetAmount) <= 0)
      e.targetAmount = "Monto objetivo inválido";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    onSubmit({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      targetAmount: Number(form.targetAmount),
      type: form.type, // "Fijo/Variable" por ahora (puedes cambiar a { fijo|variable })
      deadline: form.deadline || null,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-xl fin-card p-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base md:text-lg font-semibold">Nueva Meta de Ahorro</h3>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="stroke-current/70" fill="none">
              <path d="M6 6l12 12M18 6l-12 12" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Crea una nueva meta de ahorro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm font-medium">Nombre de la Meta</label>
            <input
              className={`input-base mt-1 ${errors.name ? "input-error" : ""}`}
              placeholder="Ej. Vacaciones de verano"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              className="input-base mt-1"
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
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

          {/* Monto Objetivo */}
          <div>
            <label className="text-sm font-medium">Monto Objetivo ($)</label>
            <input
              type="number"
              min="0"
              className={`input-base mt-1 ${errors.targetAmount ? "input-error" : ""}`}
              placeholder="3000"
              value={form.targetAmount}
              onChange={(e) =>
                setForm((s) => ({ ...s, targetAmount: e.target.value }))
              }
            />
            {errors.targetAmount && (
              <p className="text-xs text-red-500 mt-1">{errors.targetAmount}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="input-base mt-1"
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
            >
              <option>Fijo/Variable</option>
              <option>Fijo</option>
              <option>Variable</option>
            </select>
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="text-sm font-medium">Fecha Límite</label>
            <input
              type="date"
              className="input-base mt-1"
              value={form.deadline}
              onChange={(e) => setForm((s) => ({ ...s, deadline: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
