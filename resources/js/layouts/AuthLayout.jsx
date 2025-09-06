export default function AuthLayout({ title = "FinSave", subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-xl bg-indigo-600 text-white font-bold">FS</div>
          <div>
            <p className="font-semibold text-gray-900">FinSave</p>
            <p className="text-xs text-gray-500">Simulador de Ahorro y Metas</p>
          </div>
        </div>
      </header>

      <main className="grid place-items-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 text-center mt-1">{subtitle}</p>}
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
