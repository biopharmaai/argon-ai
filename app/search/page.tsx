"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "qs";
import { ClinicalTrial } from "@/types/clinicalTrials";
import SearchBar from "@/components/SearchBar";
import LimitDropdown from "@/components/LimitDropdown";
import SearchResultsTable from "@/components/SearchResultsTable";
import Pagination from "@/components/Pagination";
import { FilterToken } from "@/components/GuidedFilterBar";
import ColumnSelector from "@/components/ColumnSelector";
import type { ColumnConfig } from "@/components/ColumnSelector";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SortToken } from "@/components/GuidedSortBar";
import { columnsDefinitions } from "@/components/SearchResultsTable";
const GuidedFilterBar = dynamic(() => import("@/components/GuidedFilterBar"), {
  ssr: false,
});

const GuidedSortBar = dynamic(() => import("@/components/GuidedSortBar"), {
  ssr: false,
});

const defaultColumnsVisiblility = {
  nctId: true,
  briefTitle: true,
  organization: true,
  status: true,
  conditions: true,
  startDate: true,
  completionDate: true,
};
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
  useEffect(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.page) query.page = "1";
    const stringified = qs.stringify(query);
    setQueryString(stringified);
  }, [searchParams]);

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() => {
    const query = qs.parse(searchParams.toString());
    if (!query.fields) {
      return columnsDefinitions;
    }
    if (typeof query.fields !== "string") {
      return columnsDefinitions.map<ColumnConfig>(({ id, label }) => {
        return {
          id,
          label,
          enabled:
            defaultColumnsVisiblility[
              id as keyof typeof defaultColumnsVisiblility
            ],
        };
      });
    } else {
      const fieldIds = query.fields.split(",");
      return columnsDefinitions.map((col) => {
        return {
          ...col,
          enabled: fieldIds.includes(col.id),
        };
      });
    }
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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
      const defaultFields = [
        "nctId",
        "briefTitle",
        "organization",
        "status",
        "conditions",
        "startDate",
        "completionDate",
      ];
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
      // q.page = "1";
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

      // q.page = "1";
      setQueryString(qs.stringify(q));
      setColumnConfig(columns);
    },
    [queryString, setQueryString, setColumnConfig],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full flex-1 p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <SearchBar
            className="flex-1 bg-white"
            onSearchChange={handleSearchChange}
            queryString={queryString}
          />
          <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <SheetTitle></SheetTitle>
            <SheetTrigger asChild>
              <Button variant="outline">Advanced</Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[400px] overflow-auto sm:w-[500px]"
            >
              <SheetHeader className="mb-4 text-lg font-semibold">
                Advanced Search
              </SheetHeader>
              <div className="space-y-6">
                <ColumnSelector
                  columns={columnConfig}
                  queryString={queryString}
                  onColumnsChange={handleFieldSelectionChange}
                />
                <GuidedFilterBar
                  onFiltersCommitted={onFiltersChange}
                  queryString={queryString}
                />
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
            </SheetContent>
          </Sheet>
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
        />
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t bg-white px-6 py-3">
        <LimitDropdown
          queryString={queryString}
          onLimitsChange={onLimitChange}
        />
        <Pagination
          queryString={queryString}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
