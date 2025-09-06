export default function AuthLayout({ title = "Iniciar sesión", subtitle, children }) {
  return (
    <div className="min-h-screen bg-finsave">
      {/* Header fijo y liviano */}
      <header className="px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <img src="/assets/icons/finsave-logo.png" alt="FinSave" className="h-9 w-9 rounded-xl" />
          <div>
            <p className="font-semibold text-gray-900 leading-none">FinSave</p>
            <p className="text-xs text-gray-500">Simulador de Ahorro y Metas</p>
          </div>
        </div>
      </header>

      {/* Contenido centrado */}
      <main className="px-4">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center py-8">
          {/* Lado izquierdo: “hero” informativo */}
          <section className="hidden lg:block">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Planifica, ahorra y alcanza tus metas financieras
              </h2>
              <p className="text-gray-600">
                Crea metas, proyecta tu ahorro mensual y recibe notificaciones de progreso.
                Visualiza tu avance con gráficos claros y reportes descargables.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="badge">Proyecciones personalizadas</span>
                <span className="badge">Gráficas y reportes</span>
                <span className="badge">Recordatorios inteligentes</span>
              </div>

              {/* Tarjeta “trust” */}
              <div className="card-elevated p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 grid place-items-center rounded-xl bg-green-100 text-green-700">✓</div>
                  <div>
                    <p className="font-medium text-gray-900">Privacidad y seguridad</p>
                    <p className="text-sm text-gray-600">
                      Tus datos son tuyos. Autenticación segura, cifrado en tránsito y controles de acceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Lado derecho: tarjeta de login */}
          <section>
            <div className="card-elevated p-8">
              <h1 className="text-2xl font-semibold text-center text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500 text-center mt-1">{subtitle}</p>}

              <div className="mt-6">
                {children}
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} FinSave — Planifica, ahorra, cumple tus metas
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
