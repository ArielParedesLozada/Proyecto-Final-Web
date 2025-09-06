export default function Button({ children, loading, variant = "primary", ...props }) {
  const classes = ["btn", variant === "primary" ? "btn-primary" : "btn-ghost"].join(" ");

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/>
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
        </svg>
      )}
      <span>{loading ? "Procesando..." : children}</span>
    </button>
  );
}
