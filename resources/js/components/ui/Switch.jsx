import { useId } from "react";

export default function Switch({ checked, onChange, label, hint }) {
  const id = useId();

  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 py-2">
      <div>
        {label && <p className="font-medium">{label}</p>}
        {hint && <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={[
          "relative inline-flex shrink-0 items-center",
          "h-7 w-12 rounded-full transition-colors",
          checked ? "bg-primary-600" : "bg-gray-500/40",
          "ring-1 ring-inset",
          checked ? "ring-primary-500/50" : "ring-white/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute top-1 left-1",
            "h-5 w-5 rounded-full bg-white shadow",
            "transition-transform duration-300",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
