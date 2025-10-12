export default function EmptyState({ 
  title = "Sin datos", 
  subtitle = "Aún no hay información para mostrar.", 
  description,
  icon,
  actions,
  variant = "default",
  size = "default"
}) {
  // Iconos proporcionados con el sistema
  const defaultIcons = {
    goals: (
      <div className="w-16 h-16 mx-auto relative rounded-xl flex items-center justify-center shadow-2xl border border-indigo-300/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/90 via-indigo-500/80 to-indigo-700/90 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-200/40 to-transparent rounded-full blur-sm"></div>
        <svg className="w-8 h-8 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    ),
    transactions: (
      <div className="w-16 h-16 mx-auto relative rounded-xl flex items-center justify-center shadow-2xl border border-emerald-300/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/90 via-emerald-500/80 to-emerald-700/90 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-sm"></div>
        <svg className="w-8 h-8 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    ),
    history: (
      <div className="w-16 h-16 mx-auto relative rounded-xl flex items-center justify-center shadow-2xl border border-amber-300/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/90 via-amber-500/80 to-amber-700/90 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-200/40 to-transparent rounded-full blur-sm"></div>
        <svg className="w-8 h-8 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    completed: (
      <div className="w-16 h-16 mx-auto relative rounded-xl flex items-center justify-center shadow-2xl border border-green-300/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 via-green-500/80 to-green-700/90 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-200/40 to-transparent rounded-full blur-sm"></div>
        <svg className="w-8 h-8 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    default: (
      <div className="w-16 h-16 mx-auto relative rounded-xl flex items-center justify-center shadow-2xl border border-slate-300/40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400/90 via-slate-500/80 to-slate-700/90 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-slate-200/40 to-transparent rounded-full blur-sm"></div>
        <svg className="w-8 h-8 text-white drop-shadow-lg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
    )
  };

  // Tamaños del contenedor
  const sizeClasses = {
    small: "p-4",
    default: "p-5",
    large: "p-6"
  };

  // Variantes de estilo proporcionadas
  const variantClasses = {
    default: "fin-card text-center w-full max-w-md mx-auto",
    chart: "fin-card text-center w-full max-w-md mx-auto",
    card: "fin-card text-center",
    minimal: "text-center py-4"
  };

  const containerClasses = `${variantClasses[variant]} ${sizeClasses[size]}`;
  const selectedIcon = icon || defaultIcons[variant] || defaultIcons.default;

  return (
    <div className={containerClasses}>
      {/* Icono proporcionado */}
      <div className="flex justify-center mb-4">
        {selectedIcon}
      </div>

      {/* Contenido principal compacto */}
      <div className="space-y-4 max-w-sm mx-auto">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {description && (
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <div className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full opacity-60 ${
                variant === 'goals' ? 'bg-indigo-500' :
                variant === 'transactions' ? 'bg-emerald-500' :
                variant === 'history' ? 'bg-amber-500' :
                variant === 'completed' ? 'bg-green-500' :
                'bg-slate-500'
              }`}></div>
              <div className={`absolute top-2 right-2 w-1 h-1 rounded-full opacity-60 ${
                variant === 'goals' ? 'bg-indigo-600' :
                variant === 'transactions' ? 'bg-emerald-600' :
                variant === 'history' ? 'bg-amber-600' :
                variant === 'completed' ? 'bg-green-600' :
                'bg-slate-600'
              }`}></div>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Líneas decorativas compactas */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-gray-300 dark:to-gray-600"></div>
          <div className="flex space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              variant === 'goals' ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' :
              variant === 'transactions' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
              variant === 'history' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
              variant === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-500' :
              'bg-gradient-to-r from-slate-400 to-slate-500'
            }`}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${
              variant === 'goals' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
              variant === 'transactions' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
              variant === 'history' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
              variant === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              'bg-gradient-to-r from-slate-500 to-slate-600'
            }`}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${
              variant === 'goals' ? 'bg-gradient-to-r from-indigo-600 to-indigo-700' :
              variant === 'transactions' ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' :
              variant === 'history' ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
              variant === 'completed' ? 'bg-gradient-to-r from-green-600 to-green-700' :
              'bg-gradient-to-r from-slate-600 to-slate-700'
            }`}></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-gray-600 via-gray-300 dark:via-gray-600 to-transparent"></div>
        </div>

        {/* Información contextual compacta */}
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {variant === 'goals' ? 'Tu viaje financiero comienza aquí' :
             variant === 'transactions' ? 'Organiza tus finanzas paso a paso' :
             variant === 'history' ? 'Construye tu historial financiero' :
             'Comienza tu experiencia'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {variant === 'goals' ? 'Cada meta es un paso hacia la libertad financiera' :
             variant === 'transactions' ? 'El control financiero comienza con el primer registro' :
             variant === 'history' ? 'Tu progreso financiero se construye día a día' :
             'Cada acción cuenta en tu camino hacia el éxito'}
          </p>
        </div>
      </div>

      {/* Acciones elegantes */}
      {actions && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {actions}
        </div>
      )}
    </div>
  );
}
