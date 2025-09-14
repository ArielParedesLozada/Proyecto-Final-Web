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
        // 📱 En móvil: deja fluir el contenido
        "overflow-visible",

        // 🖥️ En desktop/XL: usa scroll interno
        "xl:min-h-0 xl:flex-1 xl:overflow-y-auto",

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
