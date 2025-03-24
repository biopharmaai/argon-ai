"use client";

import SearchBar from "./SearchBar";
import LimitDropdown from "./LimitDropdown";
import Pagination from "./Pagination";
import ColumnSelector from "./ColumnSelector";
import SearchResultsTable from "./SearchResultsTable";
import GuidedFilterBar from "./GuidedFilterBar";
import GuidedSortBar from "./GuidedSortBar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSearchPageState } from "../hooks/useSearchPageState";
import { useDialogState } from "../hooks/useDialogState";
import { useDisplayColumns } from "../hooks/useDisplayColumns";
import { useSelectionState } from "../hooks/useSelectionState";

export default function SearchPageContent() {
  const { open, handleOpen, handleClose } = useDialogState();
  const {
    selectedIds,
    setSelectedIds,
    selectAllAcrossPages,
    fetchAllMatchingIds,
    clearSelection,
  } = useSelectionState();
  const { selectedColumns, handleSelectedColumnsChange } = useDisplayColumns();

  const {
    results,
    totalResults,
    totalPages,
    queryString,
    isAdvancedOpen,
    setIsAdvancedOpen,
    handleSearchChange,
    handleSortTokensChange,
    onFiltersChange,
    onLimitChange,
    handlePageChange,
  } = useSearchPageState();

  return (
    <div className="flex flex-col pt-20">
      <div className="mx-auto w-full flex-1">
        <div className="sticky top-20 z-10 mb-6 w-full bg-white px-6 py-3 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
            {/* Search and Advanced Button */}
            <div className="flex w-full flex-col gap-2 md:w-3/5 md:flex-row md:items-end">
              <SearchBar
                className="flex-1 bg-white"
                onSearchChange={handleSearchChange}
                queryString={queryString}
              />
              <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <SheetTitle />
                <SheetDescription />
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Advanced
                  </Button>
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
                      columns={selectedColumns}
                      queryString={queryString}
                      onColumnsChange={handleSelectedColumnsChange}
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

            {/* Export Button & Selection Info */}
            <div className="flex w-full flex-col gap-2 md:w-2/5 md:items-end md:justify-end">
              <Dialog
                open={open}
                onOpenChange={(open) => (open ? handleOpen() : handleClose())}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    className="w-full md:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export studies</DialogTitle>
                    <DialogDescription>
                      Exporting {selectedIds.length} studies...
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-muted-foreground mt-4 text-sm">
                    You can customize export functionality here.
                  </div>
                </DialogContent>
              </Dialog>

              {selectedIds.length > 0 && (
                <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-sm">
                  {selectAllAcrossPages ? (
                    <span>
                      {selectedIds.length.toLocaleString()} selected across{" "}
                      {totalResults?.toLocaleString()} results.
                    </span>
                  ) : (
                    <span>
                      {`${selectedIds.length.toLocaleString()} selected.`}
                    </span>
                  )}
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-600"
                    onClick={clearSelection}
                  >
                    Clear selection
                  </Button>
                  {selectedIds.length !== totalResults && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-blue-600"
                      onClick={fetchAllMatchingIds}
                    >
                      Select all {totalResults?.toLocaleString()} studies
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
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
