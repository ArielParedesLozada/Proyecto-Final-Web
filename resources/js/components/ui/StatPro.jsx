const THEMES = {
  indigo: {
    iconWrap: "bg-indigo-500/15 ring-indigo-500/25 text-indigo-400",
    cardRing: "ring-indigo-500/10",
    stripe: "from-indigo-400/50 via-indigo-500/30 to-indigo-600/40",
  },
  emerald: {
    iconWrap: "bg-emerald-500/15 ring-emerald-500/25 text-emerald-400",
    cardRing: "ring-emerald-500/10",
    stripe: "from-emerald-400/50 via-emerald-500/30 to-emerald-600/40",
  },
  amber: {
    iconWrap: "bg-amber-500/15 ring-amber-500/25 text-amber-400",
    cardRing: "ring-amber-500/10",
    stripe: "from-amber-400/50 via-amber-500/30 to-amber-600/40",
  },
  violet: {
    iconWrap: "bg-violet-500/15 ring-violet-500/25 text-violet-400",
    cardRing: "ring-violet-500/10",
    stripe: "from-violet-400/50 via-violet-500/30 to-violet-600/40",
  },
};

export default function StatPro({
  title,
  value,
  sublabel,    
  icon,      
  variant = "indigo",
  loading = false,
}) {
  const t = THEMES[variant] ?? THEMES.indigo;

  return (
    <div
      className={[
        "fin-card p-3 md:p-4 h-full flex flex-col justify-between relative overflow-hidden",
        "ring-1 ring-white/5", 
        t.cardRing,           
      ].join(" ")}
    >
      {/* franja decorativa inferior */}
      <div
        className={[
          "pointer-events-none absolute bottom-0 left-3 right-3 h-1.5 rounded-full",
          "bg-gradient-to-r",
          t.stripe,
        ].join(" ")}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {/* título con mayor contraste */}
          <p className="text-[13px] font-semibold text-white/95 tracking-wide">
            {title}
          </p>

          {/* valor */}
          {loading ? (
            <div className="mt-2 h-8 w-28 rounded-md bg-gray-300/30 dark:bg-gray-700/40 animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight mt-1">
              {value}
            </p>
          )}
        </div>

        {/* Icono (coloreado por la variante) */}
        {icon ? (
          <div
            className={[
              "ms-3 inline-flex items-center justify-center rounded-xl p-2",
              "ring-1",
              t.iconWrap,
            ].join(" ")}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>

      {/* sublabel opcional */}
      {sublabel ? (
        <p className="mt-3 text-xs text-gray-400">{sublabel}</p>
      ) : (
        <span className="mt-2" />
      )}
    </div>
  );
}
