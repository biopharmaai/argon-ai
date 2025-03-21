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

const GuidedSortBar = dynamic(() => import("@/components/GuidedSortBar"), {
  ssr: false,
});
import { SortToken } from "@/components/GuidedSortBar";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = qs.parse(searchParams.toString());

  const [results, setResults] = useState<ClinicalTrial[]>([]);
  const [filterTokens, setFilterTokens] = useState<FilterToken[]>([]);
  const [sortTokens, setSortTokens] = useState<SortToken[]>([]);
  const [searchTerm, setSearchTerm] = useState(
    (currentQuery.term as string) || "",
  );
  const [limit, setLimit] = useState(Number(currentQuery.limit) || 10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(currentQuery.page) || 1,
  );

  const [queryString, setQueryString] = useState(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.page) query.page = (1).toString();
    return qs.stringify(query);
  });

  // Sync derived states from the actual URL query params
  useEffect(() => {
    const query = qs.parse(searchParams.toString());

    setSearchTerm((query.term as string) || "");
    setLimit(Number(query.limit) || 10);
    setCurrentPage(Number(query.page) || 1);

    if (typeof query.sort === "string") {
      const parsedSort = query.sort.split(",").map((s) => {
        const [field, dir] = s.split(":");
        return { field, direction: (dir as "asc" | "desc") || "asc" };
      });
      setSortTokens(parsedSort);
    }

    if (typeof query.filter === "object" && query.filter !== null) {
      const parsedFilters = Object.entries(query.filter).map(
        ([field, value]) => ({
          field,
          value: String(value),
        }),
      );
      setFilterTokens(parsedFilters);
    }

    setQueryString(qs.stringify(query));
  }, [searchParams]);

  // Fetch results when query string changes
  useEffect(() => {
    router.push(`?${queryString}`);
    const getData = async () => {
      const res = await fetch(`/api/search?${queryString}`);
      const json = await res.json();
      setResults(json.data);
      setTotalPages(json.totalPages);
    };
    getData();
  }, [queryString]);

  // Handlers to update search term and limit
  const handleSearchChange = useCallback(
    (term: string) => {
      const q = qs.parse(searchParams.toString());
      q.term = term;
      q.page = (1).toString();
      setQueryString(qs.stringify(q));
    },
    [searchParams],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      const q = qs.parse(searchParams.toString());
      q.limit = newLimit.toString();
      q.page = (1).toString();
      setQueryString(qs.stringify(q));
    },
    [searchParams],
  );

  const handleSortTokensChange = useCallback(
    (tokens: SortToken[]) => {
      const q = qs.parse(searchParams.toString());
      if (tokens.length > 0) {
        q.sort = tokens.map((t) => `${t.field}:${t.direction}`).join(",");
      } else {
        delete q.sort;
      }
      q.page = (1).toString();
      setQueryString(qs.stringify(q));
    },
    [searchParams],
  );

  const handlePageChange = (newPage: number) => {
    const q = qs.parse(searchParams.toString());
    q.page = newPage.toString();
    setQueryString(qs.stringify(q));
  };

  return (
    <div className="mx-auto w-full p-6">
      <h1 className="mb-4 text-2xl font-bold">Search Page</h1>
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
        <h2 className="mb-2 text-lg font-semibold">Sort Order</h2>
        <GuidedSortBar
          sortTokens={sortTokens}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <SearchResultsTable
        data={results}
        sortTokens={sortTokens}
        setQueryString={setQueryString}
        onSortChange={handleSortTokensChange}
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
  );
}
