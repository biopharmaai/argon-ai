"use client";

import { Suspense } from "react";
import SearchBar from "./SearchBar";
import LimitDropdown from "./LimitDropdown";
import Pagination from "./Pagination";
import ColumnSelector from "./ColumnSelector";
import SearchResultsTable from "./SearchResultsTable";
import GuidedFilterBar from "./GuidedFilterBar";
import GuidedSortBar from "./GuidedSortBar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearchPageState } from "../hooks/useSearchPageState";

export default function SearchPageContent() {
  const {
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
  } = useSearchPageState();

  return (
    <div className="flex flex-col pt-20">
      <div className="mx-auto w-full flex-1">
        <div className="sticky top-20 z-10 mb-6 flex flex-wrap items-end justify-between gap-4 bg-white px-6 py-3 shadow">
          <SearchBar
            className="flex-1 bg-white"
            onSearchChange={handleSearchChange}
            queryString={queryString}
          />
          <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <SheetTitle />
            <SheetDescription />
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
                  queryString={queryString}
                  onFiltersCommitted={onFiltersChange}
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
