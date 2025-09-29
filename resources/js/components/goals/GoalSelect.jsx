// src/components/goals/GoalSelect.jsx
export default function GoalSelect({ goals = [], value, onChange, className = "" }) {
  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <span className="text-base font-medium text-gray-600 dark:text-gray-300">
        Meta:
      </span>

      <div
        className={[
          "relative",
          "rounded-xl bg-white/95 dark:bg-gray-800/90",
          "ring-1 ring-gray-200/70 dark:ring-gray-700/60",
          "hover:ring-gray-300 dark:hover:ring-gray-500",
          "focus-within:ring-2 focus-within:ring-primary-500",
          "transition shadow-md"
        ].join(" ")}
      >
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={[
            "appearance-none outline-none cursor-pointer",
            "h-12 md:h-13 pl-4 pr-10",
            "text-sm md:text-base font-semibold",
            "bg-transparent rounded-xl",
            "text-gray-900 dark:text-gray-50 tracking-tight"
          ].join(" ")}
        >
          {goals.map((g) => (
            <option
              key={g}
              value={g}
              className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              {g}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
