export default function StatPro({ title, value, delta, deltaLabel, positive=true, spark=[] , icon }) {
  // spark: array de números (0-100). Se renderiza como un polilínea simple
  const H = 28, W = 80;
  const pts = spark.map((v, i) => `${(i/(spark.length-1))*W},${H - (v/100)*H}`).join(" ");

  return (
    <div className="fin-card card-hover p-4 md:p-5 h-full">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      <div className="mt-2 md:mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl md:text-3xl font-semibold tracking-tight">{value}</p>
          {delta != null && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs">
              <span className={positive ? "text-emerald-500" : "text-red-400"}>
                {positive ? "▲" : "▼"} {delta}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{deltaLabel}</span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {spark.length > 1 && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-80">
            <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-600" points={pts}/>
          </svg>
        )}
      </div>
    </div>
  );
}
