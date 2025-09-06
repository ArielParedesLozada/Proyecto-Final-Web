export default function Input({ label, id, hint, error, left, right, ...props }) {
  return (
    <label className="block mb-4" htmlFor={id}>
      {label && <span className="block mb-1 text-sm text-gray-700">{label}</span>}
      <div className="relative">
        {left && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{left}</span>}
        <input
          id={id}
          className={`w-full border rounded-lg px-3 py-2 outline-none transition pr-10
            ${left ? "pl-9" : ""}
            ${error ? "border-red-500 focus:ring-2 ring-red-200"
                     : "border-gray-300 focus:border-gray-400 focus:ring-2 ring-indigo-200"}`}
          {...props}
        />
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{right}</span>}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
