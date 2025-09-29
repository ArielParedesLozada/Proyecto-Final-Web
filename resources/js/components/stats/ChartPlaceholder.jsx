export default function ChartPlaceholder({
  variant = "line", // "line" | "bar" | "pie"
  height = 220,
}) {
  const base = "animate-pulse rounded-xl bg-gradient-to-br from-gray-100/80 to-gray-50/60 dark:from-gray-800/60 dark:to-gray-900/40 border border-gray-200/50 dark:border-gray-700/50";
  
  return (
    <div className="relative overflow-hidden">
      <div className={`${base}`} style={{ height }} />
      
      {/* Overlay con shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

      {/* Decorativos mejorados según tipo */}
      {variant === "line" && (
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          <polyline 
            points="10,150 80,120 150,140 220,90 300,110 380,60" 
            fill="none"
            stroke="url(#lineGradient)" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      
      {variant === "bar" && (
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <rect x="40" y="90" width="30" height="80" rx="2" fill="url(#barGradient1)" />
          <rect x="110" y="70" width="30" height="100" rx="2" fill="url(#barGradient2)" />
          <rect x="180" y="50" width="30" height="120" rx="2" fill="url(#barGradient1)" />
          <rect x="250" y="110" width="30" height="60" rx="2" fill="url(#barGradient2)" />
          <rect x="320" y="80" width="30" height="90" rx="2" fill="url(#barGradient1)" />
        </svg>
      )}
      
      {variant === "pie" && (
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="pieGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="pieGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="2"/>
          <path d="M100 30 A70 70 0 0 1 165 135 L100 100 Z" fill="url(#pieGradient1)" />
          <path d="M100 30 A70 70 0 1 0 165 135 L100 100 Z" fill="url(#pieGradient2)" />
        </svg>
      )}
      
      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cargando gráfica...</p>
        </div>
      </div>
    </div>
  );
}
