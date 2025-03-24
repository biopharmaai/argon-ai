import { useCallback, useState } from "react";

export function useSelectionState() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectAllAcrossPages(false);
  }, []);

  const fetchAllMatchingIds = useCallback(async () => {
    try {
      const url = new URL("/api/search", window.location.origin);
      url.search = window.location.search;
      url.searchParams.set("fullResults", "true");

      const res = await fetch(url.toString());
      const data = await res.json();

      if (Array.isArray(data.nctIds)) {
        setSelectedIds(data.nctIds);
        setSelectAllAcrossPages(true);
      } else {
        console.error("Unexpected format for nctIds in API response:", data);
      }
    } catch (e) {
      console.error("Failed to fetch all matching IDs:", e);
    }
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    selectAllAcrossPages,
    clearSelection,
    fetchAllMatchingIds,
  };
}
