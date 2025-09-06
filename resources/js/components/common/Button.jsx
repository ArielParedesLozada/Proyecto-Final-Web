export default function Button({ children, loading, variant="primary", ...props }) {
  const base = "w-full py-2.5 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const style = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
  }[variant];

  return (
    <button className={`${base} ${style}`} disabled={loading} {...props}>
      {loading ? "Procesando..." : children}
    </button>
  );
}
