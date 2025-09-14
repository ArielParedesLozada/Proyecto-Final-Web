import clsx from "clsx";
import useIsXL from "../../hooks/useIsXL";

export default function ScrollArea({
  children,
  className = "",
  maxHeight,          // mantiene compatibilidad
  maxHeightXL,        // 👈 NUEVO: solo aplica en XL
  showOnHover = false,
  style = {},
  ...props
}) {
  const isXL = useIsXL();
  const scrollClass = showOnHover ? "scroll-hover" : "scroll-invisible";

  const computedStyle = {
    ...style,
    // Si nos pasan maxHeightXL, lo aplicamos SOLO en XL; en móvil ignoramos
    maxHeight: isXL ? (maxHeightXL ?? maxHeight ?? style.maxHeight) : undefined,
  };

  return (
    <div
      className={clsx(
        // móvil: deja fluir
        "overflow-visible",
        // desktop: scroll interno
        "xl:min-h-0 xl:flex-1 xl:overflow-y-auto",
        scrollClass,
        className
      )}
      style={computedStyle}
      {...props}
    >
      {children}
    </div>
  );
}
