export default function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section
      className={
        "rounded-2xl bg-white/90 dark:bg-gray-800/60 ring-1 ring-gray-200/60 dark:ring-gray-700/50 " +
        "shadow-sm hover:shadow-md transition-shadow " + className
      }
    >
      {(title || subtitle || actions) && (
        <header className="flex items-start justify-between gap-4 p-5">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className={(title || subtitle || actions) ? "px-5 pb-5" : "p-5"}>
        {children}
      </div>
    </section>
  );
}
