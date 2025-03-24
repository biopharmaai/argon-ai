import { useEffect, useState } from "react";

export function useTableViewportHeight(containerSelector: string) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    function calculate() {
      const header = document.querySelector(containerSelector);
      if (!header) return;

      const rect = (header as HTMLElement).getBoundingClientRect();
      const available = window.innerHeight - rect.bottom;
      setHeight(available);
    }

    const handleResize = () => {
      clearTimeout((handleResize as any)._id);
      (handleResize as any)._id = setTimeout(calculate, 100);
    };

    calculate();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerSelector]);

  return height;
}
