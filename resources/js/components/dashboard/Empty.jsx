import Empty from "../components/ui/Empty";

export default function Empty({ title="Sin datos", subtitle="Aún no hay información para mostrar." }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-600/40 p-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
