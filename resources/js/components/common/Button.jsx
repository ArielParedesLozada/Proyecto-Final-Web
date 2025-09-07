export default function Button({ children, loading, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "text-white font-semibold shadow-md hover:shadow-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
    ghost:
      "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-100 dark:border-gray-700 dark:hover:bg-gray-700/60",
  };

  const classes = [base, variants[variant]].join(" ");

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      )}
      <span>{loading ? "Procesando..." : children}</span>
    </button>
  );
}
