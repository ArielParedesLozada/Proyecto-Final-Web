export function Stat({ title, value, helper, icon }) {
  return (
    <div className="fin-card p-4 md:p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="mt-2 md:mt-3">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight">{value}</p>
        {helper && <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{helper}</p>}
      </div>
    </div>
  );
}
