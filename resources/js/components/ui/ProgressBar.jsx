export function ProgressBar({ value, showLabel=false }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div>
      <div className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-gray-700/60 overflow-hidden">
        <div
          className="h-full progress-gradient"
          style={{ width: `${v}%` }}
          role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{v}%</p>}
    </div>
  );
}
