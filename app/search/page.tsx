"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import LimitDropdown from "@/components/LimitsDropdown";
import { useSearchParams } from "next/navigation";
import SearchResultsTable from "@/components/SearchResultsTable";
import { useEffect } from "react";
import qs from "qs";
import { ClinicalTrial } from "@/types/clinicalTrials";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [queryString, setQueryString] = useState("");
  const [results, setResults] = useState<ClinicalTrial[]>([]);

  useEffect(() => {
    const currentQuery = qs.parse(searchParams.toString());
    qs.parse(searchParams.toString());
    const termFromUrl = (currentQuery.search as string) || "";
    const limitFromUrl = (currentQuery.limit as string) || "10";
    setLimit(Number(limitFromUrl));
    setSearchTerm(termFromUrl);
    setQueryString(qs.stringify(currentQuery));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      return;
    }
    router.push(`?${queryString}`);

    const getData = async () => {
      const response = await fetch(`/api/search?${queryString}`);
      console.log("results returned", response);
      const results = await response.json();
      setResults(results.data);
    };
    getData();
  }, [queryString, router, searchTerm]);
  // Memoize handleSearchChange to avoid recreating it on every render
  const handleSearchChange = useCallback(
    (term: string) => {
      // Get the current query parameters as an object
      const currentQuery = qs.parse(searchParams.toString());
      // Update the search term in the query object
      const newQuery = { ...currentQuery, search: term, page: 1 }; // Reset page on new search
      // Stringify the new query object using qs
      const newQueryString = qs.stringify(newQuery);
      // Update the URL
      setQueryString(newQueryString);
      // router.push(`?${newQueryString}`);
    },
    [searchParams],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      // Get the current query parameters as an object
      const currentQuery = qs.parse(searchParams.toString());
      // Update the limit in the query object
      const newQuery = { ...currentQuery, limit: newLimit, page: 1 }; // Optionally reset page
      // Stringify the new query object using qs
      const newQueryString = qs.stringify(newQuery);
      // Update the URL
      // router.push(`?${newQueryString}`);
      setQueryString(newQueryString);
    },
    [searchParams],
  );

  // Initialize state from the query string on mount:
  useEffect(() => {
    const parsedParams = qs.parse(searchParams.toString());
    const termFromUrl = (parsedParams.search as string) || "";
    const limitFromUrl = (parsedParams.limit as string) || "10";
    setLimit(Number(limitFromUrl));
    setSearchTerm(termFromUrl);
  }, [searchParams]);

  console.log("results are ", results);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Page</h1>
      <SearchBar onChange={handleSearchChange} value={searchTerm} />
      <LimitDropdown onChange={onLimitChange} value={limit} />
      {/* Your search results and other UI would go here */}
      {results && <SearchResultsTable data={results} />}
    </div>
  );
}
