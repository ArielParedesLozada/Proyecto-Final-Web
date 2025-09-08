import { ProgressBar } from "../ui/ProgressBar";

export default function GoalItem({ name, current, target }) {
  const pct = Math.round((current / target) * 100);
  return (
    <div className="rounded-xl p-3 ring-1 ring-gray-200/60 dark:ring-gray-700/50">
      <div className="flex items-center justify-between">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{pct}%</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        ${current.toLocaleString()} de ${target.toLocaleString()}
      </p>
      <div className="mt-2">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}
