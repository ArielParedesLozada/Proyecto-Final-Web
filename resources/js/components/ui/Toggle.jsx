export default function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={[
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-primary-600" : "bg-gray-500/40",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
