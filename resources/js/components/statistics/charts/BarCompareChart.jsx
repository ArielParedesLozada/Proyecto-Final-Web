// data: [{label, actual, target}]
export default function BarCompareChart({ data = [], height = 180 }) {
  const padding = 24, gap = 18, barW = 14; // dos barras por grupo
  const max = Math.max(1, ...data.flatMap(d => [d.actual, d.target]));
  const groups = data.length;
  const width = padding * 2 + groups * (2 * barW + gap);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {/* grid simple */}
      <line x1={padding} y1={height-24} x2={width-padding} y2={height-24} stroke="currentColor" strokeOpacity="0.2"/>
      {data.map((d, i) => {
        const x0 = padding + i * (2 * barW + gap);
        const ah = Math.max(2, Math.round((d.actual / max) * (height - 40)));
        const th = Math.max(2, Math.round((d.target / max) * (height - 40)));
        return (
          <g key={d.label}>
            <rect x={x0} y={height-24-ah} width={barW} height={ah} rx="4" className="fill-primary-600/80" />
            <rect x={x0+barW+4} y={height-24-th} width={barW} height={th} rx="4" className="fill-gray-400/40 dark:fill-gray-500/30" />
            <text x={x0 + barW} y={height-6} textAnchor="middle" className="text-[10px] fill-current opacity-70">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
