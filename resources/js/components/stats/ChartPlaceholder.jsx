export default function ChartPlaceholder({
  variant = "line", // "line" | "bar" | "pie"
  height = 220,
}) {
  const base = "animate-pulse rounded-md bg-gradient-to-br from-gray-200/70 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/40";
  return (
    <div className="relative">
      <div className={`${base}`} style={{ height }} />

      {/* Decorativos ligeros según tipo */}
      {variant === "line" && (
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200" preserveAspectRatio="none">
          <polyline points="10,150 80,120 150,140 220,90 300,110 380,60" fill="none"
            stroke="currentColor" strokeWidth="4" className="text-indigo-400/60 dark:text-indigo-300/40" />
        </svg>
      )}
      {variant === "bar" && (
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200" preserveAspectRatio="none">
          <rect x="40" y="90" width="30" height="80" className="fill-indigo-400/60 dark:fill-indigo-300/40" />
          <rect x="110" y="70" width="30" height="100" className="fill-indigo-400/60 dark:fill-indigo-300/40" />
          <rect x="180" y="50" width="30" height="120" className="fill-indigo-400/60 dark:fill-indigo-300/40" />
          <rect x="250" y="110" width="30" height="60" className="fill-indigo-400/60 dark:fill-indigo-300/40" />
          <rect x="320" y="80" width="30" height="90" className="fill-indigo-400/60 dark:fill-indigo-300/40" />
        </svg>
      )}
      {variant === "pie" && (
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="18"
            className="text-indigo-300/40" />
          <path d="M100 30 A70 70 0 0 1 165 135 L100 100 Z"
            className="fill-indigo-500/60 dark:fill-indigo-400/60" />
        </svg>
      )}
    </div>
  );
}
