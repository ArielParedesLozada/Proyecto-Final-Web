export default function Input({ label, id, hint, error, left, right, ...props }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <label className="block mb-4" htmlFor={id}>
      {label && <span className="block mb-1 text-sm text-gray-700 dark:text-gray-300">{label}</span>}

      <div className="relative">
        {/* Icono a la izquierda */}
        {left && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {left}
          </span>
        )}

        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            // estilos base
            "w-full rounded-lg border bg-white/90 px-3 py-2 text-sm placeholder:text-gray-400",
            "border-gray-300/80 focus:border-gray-400",
            "focus-visible:ring-2 focus-visible:ring-indigo-600/30",
            "ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
            "dark:bg-gray-800/80 dark:border-gray-700 dark:placeholder:text-gray-500",
            "transition outline-none",
            // padding extra si hay ícono a la izquierda
            left ? "pl-9" : "",
            // padding extra si hay ícono a la derecha
            right ? "pr-9" : "",
            // error
            error ? "border-red-500 focus-visible:ring-red-500/30" : ""
          ].join(" ")}
          {...props}
        />

        {/* Icono a la derecha */}
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {right}
          </span>
        )}
      </div>

      {/* Hint o error */}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}
