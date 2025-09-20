import { useEffect, useRef, useState } from "react";
import ScrollArea from "../components/ui/ScrollArea";
import clsx from "clsx";    


export default function ResponsivePane({
  toolbar,               // JSX de tu barra (filtros, botones)
  children,              // contenido scrolleable
  bottomPadding = 24,    // espacio de aire inferior
  minPx = 240,           // altura mínima del contenido
  className = "",
}) {
  const ref = useRef(null);
  const [maxH, setMaxH] = useState("60vh");

  useEffect(() => {
    function compute() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const available = window.innerHeight - rect.bottom - bottomPadding;
      setMaxH(`${Math.max(minPx, available)}px`);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [bottomPadding, minPx]);

  return (
    <div className={clsx("flex flex-col min-h-0 xl:h-full gap-4", className)}>
      <div ref={ref}>{toolbar}</div>
      {/* En móvil, ScrollArea ignora maxHeightXL y fluye.
         En XL, aplica maxHeightXL y hace scroll interno. */}
      <ScrollArea maxHeightXL={maxH}>{children}</ScrollArea>
    </div>
  );
}
