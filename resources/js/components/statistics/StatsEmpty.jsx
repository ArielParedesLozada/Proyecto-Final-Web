import Empty from "../ui/Empty";

export default function StatsEmpty({ title = "Aún no tienes metas de ahorro", subtitle = "Crea tu primera meta para comenzar a registrar tu progreso financiero." }) {
  return (
    <div className="fin-card p-8 md:p-12 grid place-items-center bg-gray-900/80 text-center">
      <div className="max-w-xl">
        <h3 className="text-base md:text-lg font-semibold text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
      </div>
    </div>
  );
}
