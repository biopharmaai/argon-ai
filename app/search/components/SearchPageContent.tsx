"use client";

import { useState } from "react";
import _data from "@/data/ctg-studies.json";
import { ClinicalTrial } from "@/types/clinicalTrials";
const data = _data as ClinicalTrial[];

import SearchBar from "./SearchBar";
import LimitDropdown from "./LimitDropdown";
import Pagination from "./Pagination";
import ColumnSelector from "./ColumnSelector";
import SearchResultsTable from "./SearchResultsTable";
import GuidedFilterBar from "./GuidedFilterBar";
import GuidedSortBar from "./GuidedSortBar";
import { Button } from "@/components/ui/button";
import { Download, Settings } from "lucide-react";
import { columnsDefinitions } from "@/lib/constants";
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

import type { ColumnConfig, ColumnSelectorConfig } from "@/types/columns";
export function toSelectorConfig(
  columns: ColumnConfig[],
): ColumnSelectorConfig[] {
  return columns.map(({ id, label, enabled }) => ({
    id,
    label,
    enabled: !!enabled,
  }));
}

export function mergeSelectorWithColumns(
  selectorConfig: ColumnSelectorConfig[],
  fullColumns: ColumnConfig[],
): ColumnConfig[] {
  const fullMap = new Map(fullColumns.map((col) => [col.id, col]));

  // Preserve the order from selectorConfig first
  const selectedOrdered: ColumnConfig[] = selectorConfig.map((sel) => {
    const col = fullMap.get(sel.id);
    return col
      ? {
          ...col,
          enabled: sel.enabled,
        }
      : {
          id: sel.id,
          label: sel.label,
          accessor: () => "",
          enabled: sel.enabled,
        };
  });

  // Add any remaining columns from fullColumns not in selectorConfig
  const selectedIds = new Set(selectorConfig.map((c) => c.id));
  const remaining = fullColumns
    .filter((col) => !selectedIds.has(col.id))
    .map((col) => ({
      ...col,
      enabled: false,
    }));

  return [...selectedOrdered, ...remaining];
}
function toCsv(
  data: ClinicalTrial[],
  columns: {
    id: string;
    accessor: (row: ClinicalTrial) => string | undefined;
  }[],
) {
  const header = columns.map((col) => col.id).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => `"${(col.accessor(row) ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function SearchPageContent() {
  const { open, handleOpen, handleClose } = useDialogState();
  const {
    selectedIds,
    setSelectedIds,
    selectAllAcrossPages,
    fetchAllMatchingIds,
    clearSelection,
  } = useSelectionState();
  const {
    selectedColumns: defaultSelectedColumns,
    handleSelectedColumnsChange,
  } = useDisplayColumns();
  const [selectedColumns, setSelectedColumns] = useState(
    defaultSelectedColumns,
  );

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

  const [format, setFormat] = useState<"json" | "csv">("json");
  const [zipEach, setZipEach] = useState(false);

  const handleBulkDownload = async () => {
    const date = new Date().toISOString().split("T")[0];
    const trials = data.filter((d) =>
      selectedIds.includes(d.protocolSection.identificationModule.nctId),
    );

    if (zipEach) {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const trial of trials) {
        const nctId = trial.protocolSection.identificationModule.nctId;
        const content =
          format === "json"
            ? JSON.stringify(trial, null, 2)
            : toCsv(
                [trial],
                selectedColumns as {
                  id: string;
                  accessor: (row: ClinicalTrial) => string | undefined;
                }[],
              );
        zip.file(`${nctId}.${format}`, content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `${date}-study-${format}.zip`);
    } else {
      const content =
        format === "json"
          ? JSON.stringify(trials, null, 2)
          : toCsv(
              trials,
              selectedColumns as {
                id: string;
                accessor: (row: ClinicalTrial) => string | undefined;
              }[],
            );
      const blob = new Blob([content], {
        type:
          format === "json" ? "application/json" : "text/csv;charset=utf-8;",
      });
      triggerDownload(blob, `${date}-study.${format}`);
    }

    handleClose();
  };

  const handleColumnChange = (selectorConfig: ColumnSelectorConfig[]) => {
    const merged = mergeSelectorWithColumns(selectorConfig, columnsDefinitions);
    setSelectedColumns(merged);
    handleSelectedColumnsChange(merged);
  };
  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full flex-1">
        <div className="mb-6 w-full space-y-2 bg-white px-6 py-3 shadow">
          {/* First row: SearchBar and Advanced Button */}
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-end">
            <div className="w-full max-w-5xl md:w-[75%]">
              <SearchBar
                className="w-full bg-white"
                onSearchChange={handleSearchChange}
                queryString={queryString}
              />
            </div>
            <div className="w-full md:w-1/5">
              <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <SheetTitle />
                <SheetDescription />
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex h-10 w-full items-center px-4 md:w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
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
                      columns={toSelectorConfig(
                        selectedColumns.filter((c) => c.enabled),
                      )}
                      queryString={queryString}
                      onColumnsChange={handleColumnChange}
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
          </div>

          {/* Second row: Selection info and Export Button */}
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
            <div className="text-muted-foreground flex min-h-[1.5rem] w-full max-w-5xl flex-wrap items-center gap-x-2 pl-3 text-sm md:w-[75%]">
              {selectedIds.length > 0 ? (
                <>
                  {selectAllAcrossPages ? (
                    <span>
                      {selectedIds.length.toLocaleString()} selected across{" "}
                      {totalResults?.toLocaleString()} results.
                    </span>
                  ) : (
                    <span>
                      {`${selectedIds.length.toLocaleString()}–${totalResults?.toLocaleString()} selected.`}
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
                </>
              ) : (
                <span className="invisible select-none">No selection</span>
              )}
            </div>
            <div className="w-full md:w-1/5">
              <Dialog
                open={open}
                onOpenChange={(open) => (open ? handleOpen() : handleClose())}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    disabled={selectedIds.length === 0}
                    className="flex h-10 w-full items-center px-4 md:w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Clinical Trials</DialogTitle>
                    <DialogDescription>
                      Exporting {selectedIds.length} studies...
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <select
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={format}
                        onChange={(e) =>
                          setFormat(e.target.value as "json" | "csv")
                        }
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="zipEach"
                        type="checkbox"
                        checked={zipEach}
                        onChange={(e) => setZipEach(e.target.checked)}
                      />
                      <label htmlFor="zipEach" className="text-sm">
                        Zip individual studies into separate files
                      </label>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleBulkDownload}
                      disabled={selectedIds.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <SearchResultsTable
          data={results}
          querystring={queryString}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
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
