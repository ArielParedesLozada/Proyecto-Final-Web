export default function CompletedList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-3">
          <span className="mt-[6px] h-2.5 w-2.5 rounded-full bg-primary-600/80" />
          <div>
            <p className="text-sm font-medium">{it.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{it.when}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
