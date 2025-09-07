export default function AuthLayout({ title = "FinSave", subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header compacto */}
      <header className="px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <div className="h-9 w-9">
            <img
              src="/assets/icons/Logo_FinSave.png"
              alt="FinSave logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="font-semibold">FinSave</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Simulador de Ahorro y Metas</p>
          </div>
        </div>
      </header>

      {/* Main con fondo decorativo sutil */}
      <main className="relative flex-1 grid place-items-center px-4">
        {/* “Halo” de color detrás del card */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 w-[36rem] rounded-full blur-3xl opacity-30
                        bg-gradient-to-r from-primary-600 to-indigo-400" />
        <div className="w-full max-w-md bg-white/10 dark:bg-white/5 backdrop-blur-md
                rounded-2xl border border-white/10 shadow-xl p-8">

          <h1 className="text-2xl font-semibold text-center">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{subtitle}</p>}
          <div className="mt-6">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} FinSave – Planifica, ahorra, cumple tus metas
      </footer>
    </div>
  );
}
