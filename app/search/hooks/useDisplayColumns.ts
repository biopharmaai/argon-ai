"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
import { columnsDefinitions } from "@/lib/constants";
import type { ColumnConfig } from "@/types/columns";

export function useDisplayColumns() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedColumns, setSelectedColumns] = useState<ColumnConfig[]>([]);

  useEffect(() => {
    const query = qs.parse(searchParams.toString());
    const fieldIds =
      typeof query.fields === "string" ? query.fields.split(",") : [];

    const enabledSet = new Set(fieldIds);
    const enabled: ColumnConfig[] = fieldIds
      .map((id) => columnsDefinitions.find((c) => c.id === id))
      .filter(Boolean) as ColumnConfig[];

    const disabled = columnsDefinitions
      .filter((c) => !enabledSet.has(c.id))
      .map((c) => ({ ...c, enabled: false }));

    setSelectedColumns([
      ...enabled.map((c) => ({ ...c, enabled: true })),
      ...disabled,
    ]);
  }, [searchParams]);

  const handleSelectedColumnsChange = useCallback(
    (cols: ColumnConfig[]) => {
      setSelectedColumns(cols);

      const query = qs.parse(searchParams.toString());
      const enabledFields = cols.filter((c) => c.enabled).map((c) => c.id);
      if (enabledFields.length > 0) {
        query.fields = enabledFields.join(",");
      } else {
        delete query.fields;
      }

      const newQuery = qs.stringify(query, { addQueryPrefix: true });
      router.replace(`${pathname}${newQuery}`);
    },
    [router, pathname, searchParams],
  );

  return {
    selectedColumns,
    handleSelectedColumnsChange,
  };
}
