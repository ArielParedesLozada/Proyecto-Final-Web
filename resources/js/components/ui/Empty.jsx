export default function Empty({ title="Sin datos", subtitle="Aún no hay información para mostrar." }) {
  return (
    <div className="fin-card p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
