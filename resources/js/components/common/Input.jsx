export default function Input({ label, id, hint, error, left, right, ...props }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <label className="block mb-4" htmlFor={id}>
      {label && <span className="block mb-1 text-sm">{label}</span>}
      <div className="relative">
        {left && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{left}</span>}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={[
            "input-base pr-10 transition",
            left ? "pl-9" : "",
            error ? "input-error" : ""
          ].join(" ")}
          {...props}
        />
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{right}</span>}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
