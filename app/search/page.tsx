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
import Pagination from "@/components/Pagination";
import { SortToken } from "@/components/GuidedSortBar";

const GuidedSortBar = dynamic(() => import("@/components/GuidedSortBar"), {
  ssr: false,
});

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ClinicalTrial[]>([]);
  const [totalResults, setTotalResults] = useState<null | number>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [queryString, setQueryString] = useState(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.page) query.page = "1";
    return qs.stringify(query);
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);

  // Fetch paginated search results
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
    const res = await fetch(`/api/search/ids?${queryString}`);
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

  // Search, Filter, and Sort Handlers
  const handleSearchChange = useCallback(
    (term: string) => {
      const q = qs.parse(queryString);
      q.term = term;
      q.page = "1";
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

  const handleSortTokensChange = useCallback(
    (tokens: SortToken[]) => {
      const q = qs.parse(queryString);
      if (tokens.length > 0) {
        q.sort = tokens.map((t) => `${t.field}:${t.direction}`).join(",");
      } else {
        delete q.sort;
      }
      q.page = "1";
      setQueryString(qs.stringify(q));
      clearSelection();
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

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full flex-1 p-6">
        <h1 className="mb-4 text-2xl font-bold">Search Page</h1>

        <SearchBar
          onSearchChange={handleSearchChange}
          queryString={queryString}
        />

        <div className="mt-4">
          <GuidedFilterBar
            onFiltersCommitted={onFiltersChange}
            queryString={queryString}
          />
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-lg font-semibold">Sort Order</h2>
          <GuidedSortBar
            queryString={queryString}
            onSortTokensChange={handleSortTokensChange}
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

        <SearchResultsTable
          data={results}
          querystring={queryString}
          totalCount={totalResults ?? 0}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          selectAllAcrossPages={selectAllAcrossPages}
          onSelectAllAcrossPages={fetchAllMatchingIds}
          onClearSelection={clearSelection}
          onSortTokensChange={handleSortTokensChange}
          displayColumns={[
            "selection",
            "nctId",
            "briefTitle",
            "organization",
            "status",
            "conditions",
            "startDate",
            "completionDate",
          ]}
        />
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t bg-white px-6 py-3">
        <Pagination
          queryString={queryString}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <LimitDropdown
          queryString={queryString}
          onLimitsChange={onLimitChange}
        />
      </div>
    </div>
  );
}
