export default function EmptyGoals({ onCreate }) {
  return (
    <div className="fin-card p-8 text-center">
      <h3 className="font-semibold">Aún no tienes metas de ahorro</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Crea tu primera meta para comenzar a registrar tu progreso financiero.
      </p>
    </div>
  );
}
