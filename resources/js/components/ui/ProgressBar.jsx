export function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-gray-700/60 overflow-hidden">
      <div
        className="h-full bg-primary-600"
        style={{ width: `${v}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        role="progressbar"
      />
    </div>
  );
}
