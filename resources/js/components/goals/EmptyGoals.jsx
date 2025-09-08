export default function EmptyGoals({ onCreate }) {
  return (
    <div className="fin-card p-8 text-center">
      <div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-200">
        <svg width="22" height="22" viewBox="0 0 24 24" className="stroke-current" fill="none">
          <path d="M12 5v14M5 12h14" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="font-semibold">Aún no tienes metas de ahorro</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Crea tu primera meta para comenzar a registrar tu progreso financiero.
      </p>
      <div className="mt-4">
        <button className="btn btn-primary" onClick={onCreate}>
          Nueva Meta
        </button>
      </div>
    </div>
  );
}
