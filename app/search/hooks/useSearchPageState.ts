"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
import { ClinicalTrial } from "@/types/clinicalTrials";
import type { FilterToken } from "../components/GuidedFilterBar";
import { columnsDefinitions } from "@/lib/constants";
import { SortToken } from "../components/GuidedSortBar";
import type { ColumnConfig } from "@/types/columns";
import { defaultFields } from "@/lib/constants";

export function useSearchPageState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ClinicalTrial[]>([]);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);

  const [queryString, setQueryString] = useState(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.page) query.page = "1";
    return qs.stringify(query);
  });

  useEffect(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.page) query.page = "1";
    const stringified = qs.stringify(query);
    setQueryString(stringified);
  }, [searchParams]);

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.fields) {
      return columnsDefinitions.map((col) => ({
        ...col,
        enabled: defaultFields.includes(col.id),
      }));
    } else if (typeof query.fields !== "string") {
      return columnsDefinitions.map<ColumnConfig>(
        ({ id, label, accessor, cell }) => ({
          id,
          label,
          accessor,
          cell,
          enabled: defaultFields.includes(id),
        }),
      );
    } else {
      const fieldIds = query.fields.split(",");
      return columnsDefinitions.map((col) => ({
        ...col,
        enabled: fieldIds.includes(col.id),
      }));
    }
  });

  useEffect(() => {
    router.push(`?${queryString}`);
    const getData = async () => {
      const res = await fetch(`/api/search?${queryString}`);
      const json = await res.json();
      setResults(json.data);
      setTotalResults(json.totalCount);
      setTotalPages(json.totalPages);
    };
    getData();
  }, [queryString, router]);

  const fetchAllMatchingIds = useCallback(async () => {
    const queryObj = qs.parse(queryString, { ignoreQueryPrefix: true });
    queryObj.fullResults = "true";
    delete queryObj.page;
    delete queryObj.limit;
    const newQuery = qs.stringify(queryObj);
    const res = await fetch(`/api/search?${newQuery}`);
    const json = await res.json();
    if (json.success) {
      setSelectedIds(json.nctIds);
      setSelectAllAcrossPages(true);
    }
  }, [queryString]);

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectAllAcrossPages(false);
  };

  const handleSearchChange = useCallback(
    (term: string) => {
      const q = qs.parse(queryString);
      q.term = term;
      const hasSearch = term.trim() !== "";
      const hasFields = typeof q.fields === "string";
      if (hasSearch && !hasFields) {
        q.fields = defaultFields.join(",");
      }
      q.page = "1";
      setQueryString(qs.stringify(q));
      clearSelection();
    },
    [queryString],
  );

  const onFiltersChange = useCallback(
    (updatedFilters: FilterToken[]) => {
      const q = qs.parse(queryString);
      if (updatedFilters.length > 0) {
        q.filter = updatedFilters.reduce(
          (acc, { field, value }) => ({ ...acc, [field]: value }),
          {},
        );
      } else {
        delete q.filter;
      }
      setQueryString(qs.stringify(q));
      clearSelection();
    },
    [queryString],
  );

  const handleSortTokensChange = useCallback(
    (tokens: SortToken[]) => {
      const q = qs.parse(queryString);
      if (tokens.length > 0) {
        q.sort = tokens.map((t) => `${t.field}:${t.direction}`).join(",");
      } else {
        delete q.sort;
      }
      setQueryString(qs.stringify(q));
      clearSelection();
    },
    [queryString],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      const q = qs.parse(queryString);
      q.limit = newLimit.toString();
      q.page = "1";
      setQueryString(qs.stringify(q));
      clearSelection();
    },
    [queryString],
  );

  const handleFieldSelectionChange = useCallback(
    (columns: ColumnConfig[]) => {
      const q = qs.parse(queryString);
      const enabledFields = columns
        .filter((col) => col.enabled)
        .map((col) => col.id);
      if (enabledFields.length > 0) {
        q.fields = enabledFields.join(",");
      } else {
        delete q.fields;
      }
      setQueryString(qs.stringify(q));
      setColumnConfig(columns);
    },
    [queryString],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const q = qs.parse(queryString);
      q.page = newPage.toString();
      setQueryString(qs.stringify(q));
    },
    [queryString],
  );

  return {
    results,
    totalResults,
    totalPages,
    queryString,
    columnConfig,
    isAdvancedOpen,
    setIsAdvancedOpen,
    selectedIds,
    setSelectedIds,
    selectAllAcrossPages,
    fetchAllMatchingIds,
    clearSelection,
    handleSearchChange,
    handleSortTokensChange,
    handleFieldSelectionChange,
    onFiltersChange,
    onLimitChange,
    handlePageChange,
  };
}
