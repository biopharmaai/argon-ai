"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
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
// import ColumnSelector, { ColumnConfig } from "@/components/ColumnSelector";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = qs.parse(searchParams.toString());

  // Initialize search term and limit from query string.
  const termFromUrl = (currentQuery.term as string) || "";
  const limitFromUrl = Number((currentQuery.limit as string) || "10");

  const [searchTerm, setSearchTerm] = useState(termFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);
  const [filterTokens, setFilterTokens] = useState<FilterToken[]>([]);
  const sortFromUrl = (currentQuery.sort as string) || "";
  const initialSortTokens: SortToken[] = sortFromUrl
    .split(",")
    .filter(Boolean)
    .map((tokenStr) => {
      const [field, direction] = tokenStr.split(":");
      return { field, direction: (direction as "asc" | "desc") || "asc" };
    });
  const [sortTokens, setSortTokens] = useState<SortToken[]>(initialSortTokens);
  const [queryString, setQueryString] = useState(qs.stringify(currentQuery));
  const [results, setResults] = useState<ClinicalTrial[]>([]);

  const hasMountedRef = useRef(false);

  // Rebuild the query string when filters, sort tokens, search term, limit, or columns change.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return; // Skip initial sync on mount
    }

    const q = qs.parse(searchParams.toString());
    q.term = searchTerm;
    q.limit = limit;

    if (filterTokens.length > 0) {
      q.filter = {};
      filterTokens.forEach((token) => {
        q.filter[token.field] = token.value;
      });
    } else if ('filter' in q) {
      delete q.filter;
    }

    if (sortTokens.length > 0) {
      q.sort = sortTokens.map((t) => `${t.field}:${t.direction}`).join(',');
    } else if ('sort' in q) {
      delete q.sort;
    }

    q.page = 1;
    const newQS = qs.stringify(q);
    if (newQS !== queryString) {
      console.log("SearchPage - Rebuilding query string from state:", q);
      setQueryString(newQS);
    }
  }, [
    filterTokens,
    sortTokens,
    searchTerm,
    limit,
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
          queryString={queryString}
          updateQueryString={setQueryString}
        />
      </div>

      <div className="mt-4">
        <LimitDropdown onChange={onLimitChange} value={limit} />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Sort Order</h2>
        <GuidedSortBar
          sortTokens={sortTokens}
          queryString={queryString}
          onSortTokensChange={(parsedTokens) => {
            setSortTokens(parsedTokens);
            const parsed = qs.parse(queryString);
            setQueryString(qs.stringify(parsed));
          }}
          setQueryString={setQueryString}
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

      {results && (
        <SearchResultsTable
          data={results}
          queryString={queryString}
          setQueryString={setQueryString}
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
      )}
    </div>
  );
}
