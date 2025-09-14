// segments: [{label, value, color?}], total opcional; gapDegrees opcional
export default function DonutChart({ segments = [], size = 160, thickness = 18, gapDegrees = 2, total }) {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0);
  const cx = size / 2, cy = size / 2, r = (size - thickness) / 2;

  // Circunferencia útil descontando gaps
  const gapsTotal = gapDegrees * segments.length;
  const circumference = 2 * Math.PI * r;
  const usable = circumference * (1 - gapsTotal / 360);

  let acc = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-40">
      {/* base */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const frac = sum ? s.value / sum : 0;
        const len = usable * frac;
        const gap = (circumference - usable) / segments.length;
        const dashArray = `${len} ${circumference - len}`;
        const dashOffset = -(acc + gap / 2);
        acc += len + gap;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color || "var(--color-primary-600)"}
            strokeWidth={thickness}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className="transition-all"
          />
        );
      })}
    </svg>
  );
}
