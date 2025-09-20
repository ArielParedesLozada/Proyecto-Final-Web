import { useEffect, useState } from "react";

export default function useIsXL() {
  const [isXL, setIsXL] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1280px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = (e) => setIsXL(e.matches);
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange);           // fallback
    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
    };
  }, []);

  return isXL;
}
