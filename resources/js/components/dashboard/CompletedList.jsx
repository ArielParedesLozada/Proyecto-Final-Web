import { formatYMDShort } from "../../services/dates";

export default function CompletedList({ items }) {
  return (
    <ol className="relative ms-3">
      <span className="absolute left-0 -ms-3 h-full w-px bg-gray-300/40 dark:bg-gray-700/40" />
      {items.map((it) => {
        const title = it.title ?? it.name ?? "—";
        // Prioriza fecha real de finalización; si no hay, usa deadline como fallback
        const whenYMD = it.finishedAt || it.deadline || "";
        const whenTxt = formatYMDShort(whenYMD);

        return (
          <li key={it.id} className="relative pl-4 py-3">
            <span className="absolute -left-2 top-3 h-2.5 w-2.5 rounded-full bg-primary-600 shadow" />
            <p className="text-sm font-medium">{title}</p>
            {whenTxt ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">{whenTxt}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
