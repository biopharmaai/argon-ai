import { useCallback, useEffect, useState } from "react";
import { defaultColumns } from "@/lib/constants";
import { ColumnConfig } from "@/types/columns";

const STORAGE_KEY = "argon.selectedColumns";

/**
 * Hook to manage the selected display columns
 */
export function useDisplayColumns() {
  const [selectedColumns, setSelectedColumns] =
    useState<ColumnConfig[]>(defaultColumns);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedColumns(parsed);
      } catch (e) {
        console.error("Failed to parse stored columns:", e);
      }
    }
  }, []);

  const handleSelectedColumnsChange = useCallback((cols: ColumnConfig[]) => {
    setSelectedColumns(cols);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
  }, []);

  return {
    selectedColumns,
    handleSelectedColumnsChange,
  };
}
