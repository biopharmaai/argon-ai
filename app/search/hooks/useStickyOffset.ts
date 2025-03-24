import { useEffect, useState } from "react";

export function useStickyOffset(selector: string) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function calculate() {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect();
        setOffset(rect.bottom);
      }
    }

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [selector]);

  return offset;
}
