"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
import { ClinicalTrial } from "@/types/clinicalTrials";
import SearchBar from "@/components/SearchBar";
import LimitDropdown from "@/components/LimitDropdown";
import SearchResultsTable from "@/components/SearchResultsTable";
import GuidedFilterBar, { FilterToken } from "@/components/GuidedFilterBar";
// Import GuidedSortBar with SSR disabled.
const GuidedSortBar = dynamic(() => import("@/components/GuidedSortBar"), {
  ssr: false,
});
import { SortToken } from "@/components/GuidedSortBar";
// Import ColumnSelector
import ColumnSelector, { ColumnConfig } from "@/components/ColumnSelector";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = qs.parse(searchParams.toString());

  // Initialize search term and limit from query string.
  const termFromUrl = (currentQuery.term as string) || "";
  const limitFromUrl = Number((currentQuery.limit as string) || "10");

  // Define default columns.
  const defaultColumns: ColumnConfig[] = [
    { id: "selection", label: "#", enabled: true },
    { id: "nctId", label: "NCT ID", enabled: true },
    { id: "briefTitle", label: "Title", enabled: true },
    { id: "organization", label: "Sponsor / Organization", enabled: true },
    { id: "status", label: "Status", enabled: true },
    { id: "conditions", label: "Conditions", enabled: true },
    { id: "startDate", label: "Start Date", enabled: true },
    { id: "completionDate", label: "Completion Date", enabled: true },
  ];

  // If the query string has a "columns" parameter, initialize enabled state accordingly.
  let initialColumns: ColumnConfig[] = defaultColumns;
  if (currentQuery.columns) {
    const columnsParam = currentQuery.columns as string;
    const enabledIds = columnsParam.split(",");
    initialColumns = defaultColumns.map((col) => ({
      ...col,
      enabled: enabledIds.includes(col.id),
    }));
  }

  const [searchTerm, setSearchTerm] = useState(termFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);
  const [filterTokens, setFilterTokens] = useState<FilterToken[]>([]);
  const [sortTokens, setSortTokens] = useState<SortToken[]>([]); // default no sort tokens if desired
  const [displayColumns, setDisplayColumns] =
    useState<ColumnConfig[]>(initialColumns);
  const [queryString, setQueryString] = useState(qs.stringify(currentQuery));
  const [results, setResults] = useState<ClinicalTrial[]>([]);

  // Rebuild the query string when filters, sort tokens, search term, limit, or columns change.
  useEffect(() => {
    const q = qs.parse(searchParams.toString());
    q.term = searchTerm;
    q.limit = limit;

    filterTokens.forEach((token) => {
      q[`filter[${token.field}]`] = token.value;
    });
    if (sortTokens.length > 0) {
      q.sort = sortTokens.map((t) => `${t.field}:${t.direction}`).join(",");
    }
    // Build the columns param from enabled columns, in order.
    const enabledCols = displayColumns
      .filter((col) => col.enabled)
      .map((col) => col.id);
    q.columns = enabledCols.join(",");
    q.page = 1;
    setQueryString(qs.stringify(q));
  }, [
    filterTokens,
    sortTokens,
    searchTerm,
    limit,
    displayColumns,
    searchParams,
  ]);

  // Push the query string to the URL and fetch results.
  useEffect(() => {
    router.push(`?${queryString}`);
    const getData = async () => {
      const response = await fetch(`/api/search?${queryString}`);
      const json = await response.json();
      setResults(json.data);
    };
    getData();
  }, [queryString, router]);

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      const q = qs.parse(searchParams.toString());
      q.term = term;
      q.page = 1;
      setQueryString(qs.stringify(q));
    },
    [searchParams],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      const q = qs.parse(searchParams.toString());
      q.limit = newLimit;
      q.page = 1;
      setQueryString(qs.stringify(q));
    },
    [searchParams],
  );

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Page</h1>
      <SearchBar onChange={handleSearchChange} value={searchTerm} />

      <div className="mt-4">
        <GuidedFilterBar
          filters={filterTokens}
          onFiltersChange={setFilterTokens}
        />
      </div>

      <div className="mt-4">
        <LimitDropdown onChange={onLimitChange} value={limit} />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Sort Order</h2>
        <GuidedSortBar
          sortTokens={sortTokens}
          onSortTokensChange={setSortTokens}
          sortableFields={[
            "nctId",
            "briefTitle",
            "organization",
            "status",
            "startDate",
            "completionDate",
          ]}
        />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Display Columns</h2>
        <ColumnSelector
          columns={displayColumns}
          onColumnsChange={setDisplayColumns}
        />
      </div>

      {results && (
        <SearchResultsTable
          data={results}
          queryString={queryString}
          setQueryString={setQueryString}
          displayColumns={displayColumns
            .filter((col) => col.enabled)
            .map((col) => col.id)}
        />
      )}
    </div>
  );
}
