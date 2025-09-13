import clsx from "clsx";

export default function ScrollArea({
  children,
  className = "",
  maxHeight,           // p.ej. "56vh" o "420px"
  showOnHover = false, // false = invisible siempre; true = aparece al hover
  style = {},
  ...props
}) {
  const scrollClass = showOnHover ? "scroll-hover" : "scroll-invisible";

  return (
    <div
      className={clsx(
        "min-h-0 flex-1 overflow-y-auto", // base para que scrollee bien en layouts flex/grid
        scrollClass,
        className
      )}
      style={{ maxHeight: maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
