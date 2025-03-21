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
// Import GuidedSortBar with SSR disabled to avoid hydration issues
const GuidedSortBar = dynamic(() => import("@/components/GuidedSortBar"), {
  ssr: false,
});
import { SortToken } from "@/components/GuidedSortBar";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from query string (source of truth)
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [filterTokens, setFilterTokens] = useState<FilterToken[]>([]);
  const [sortTokens, setSortTokens] = useState<SortToken[]>([]);
  const [queryString, setQueryString] = useState("");
  const [results, setResults] = useState<ClinicalTrial[]>([]);

  // On mount (or when searchParams change), update initial state from the query string.
  useEffect(() => {
    const parsedParams = qs.parse(searchParams.toString());

    // Initialize search term & limit
    const termFromUrl = (parsedParams.term as string) || "";
    const limitFromUrl = Number(parsedParams.limit) || 10;
    setSearchTerm(termFromUrl);
    setLimit(limitFromUrl);

    // Parse filter tokens from keys that start with "filter["
    const filters: FilterToken[] = [];
    for (const key in parsedParams) {
      if (key.startsWith("filter[")) {
        const field = key.slice(7, key.length - 1); // remove "filter[" and trailing "]"
        const value = parsedParams[key] as string;
        filters.push({ field, value });
      }
    }
    setFilterTokens(filters);

    // Parse sort tokens from the sort parameter
    const sortParam = (parsedParams.sort as string) || "";
    const sorts: SortToken[] = sortParam
      .split(",")
      .filter((token) => token.trim() !== "")
      .map((tokenStr) => {
        const [field, direction] = tokenStr.split(":");
        return { field, direction: (direction || "asc") as "asc" | "desc" };
      });
    // If no sort tokens exist, default to nctId:asc
    if (sorts.length === 0) {
      // sorts.push({ field: "nctId", direction: "asc" });
    }
    setSortTokens(sorts);

    // Finally, set the query string state as the current URL's query string
    setQueryString(qs.stringify(parsedParams));
  }, [searchParams]);

  /**
   * Whenever filterTokens or sortTokens change, rebuild the query string.
   */
  useEffect(() => {
    const q = qs.parse(searchParams.toString());

    // Update term and limit if present
    q.term = searchTerm;
    q.limit = limit;

    // Add filter tokens to the query (using bracket notation)
    filterTokens.forEach((token) => {
      q[`filter[${token.field}]`] = token.value;
    });

    // Add sort tokens as a comma-separated list
    if (sortTokens.length > 0) {
      q.sort = sortTokens.map((t) => `${t.field}:${t.direction}`).join(",");
    }

    // Reset page to 1 when filters/sorts change
    q.page = 1;
    const newQS = qs.stringify(q);
    setQueryString(newQS);
  }, [filterTokens, sortTokens, searchTerm, limit, searchParams]);

  /**
   * When queryString updates, push new URL and fetch data.
   */
  useEffect(() => {
    router.push(`?${queryString}`);
    const getData = async () => {
      const response = await fetch(`/api/search?${queryString}`);
      const resultsData = await response.json();
      setResults(resultsData.data);
    };
    getData();
  }, [queryString, router]);

  /**
   * Handlers for search term and limit changes.
   */
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

      {results && (
        <SearchResultsTable
          data={results}
          queryString={queryString}
          setQueryString={setQueryString}
        />
      )}
    </div>
  );
}
