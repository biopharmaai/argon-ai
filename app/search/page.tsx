// In /app/search/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
import { ClinicalTrial } from "@/types/clinicalTrials";
import SearchBar from "@/components/SearchBar";
import LimitDropdown from "@/components/LimitDropdown";
import SearchResultsTable from "@/components/SearchResultsTable";
import GuidedFilterBar, { FilterToken } from "@/components/GuidedFilterBar";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse initial query parameters
  const currentQuery = qs.parse(searchParams.toString());
  const termFromUrl = (currentQuery.term as string) || "";
  const limitFromUrl = Number((currentQuery.limit as string) || "10");

  const [searchTerm, setSearchTerm] = useState(termFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);
  const [filters, setFilters] = useState<FilterToken[]>([]);
  const [queryString, setQueryString] = useState(qs.stringify(currentQuery));
  const [results, setResults] = useState<ClinicalTrial[]>([]);

  // Update query string when filters change
  useEffect(() => {
    const currentQuery = qs.parse(searchParams.toString());
    filters.forEach((token) => {
      currentQuery[`filter[${token.field}]`] = token.value;
    });
    currentQuery["page"] = 1;
    setQueryString(qs.stringify(currentQuery));
  }, [filters, searchParams]);

  // When query string updates, push new URL and fetch data
  useEffect(() => {
    router.push(`?${queryString}`);
    const getData = async () => {
      const response = await fetch(`/api/search?${queryString}`);
      const resultsData = await response.json();
      setResults(resultsData.data);
    };
    getData();
  }, [queryString, router]);

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      const currentQuery = qs.parse(searchParams.toString());
      const newQuery = { ...currentQuery, term: term, page: 1 };
      setQueryString(qs.stringify(newQuery));
    },
    [searchParams],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      const currentQuery = qs.parse(searchParams.toString());
      const newQuery = { ...currentQuery, limit: newLimit, page: 1 };
      setQueryString(qs.stringify(newQuery));
    },
    [searchParams],
  );

  useEffect(() => {
    const parsedParams = qs.parse(searchParams.toString());
    const termFromUrl = (parsedParams.term as string) || "";
    const limitFromUrl = (parsedParams.limit as string) || "10";
    setSearchTerm(termFromUrl);
    setLimit(Number(limitFromUrl));
  }, [searchParams]);

  return (
    <div className="w-full mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Page</h1>
      <SearchBar onChange={handleSearchChange} value={searchTerm} />
      <div className="mt-4">
        <GuidedFilterBar filters={filters} onFiltersChange={setFilters} />
      </div>
      <div className="mt-4">
        <LimitDropdown onChange={onLimitChange} value={limit} />
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
