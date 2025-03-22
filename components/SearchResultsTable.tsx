// SearchResultsTable.tsx
"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import qs from "qs";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { SortToken } from "@/components/GuidedSortBar";

type Props = {
  data: ClinicalTrial[];
  querystring: string;
  totalCount: number;
  displayColumns: string[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  selectAllAcrossPages: boolean;
  onSelectAllAcrossPages: () => void;
  onClearSelection: () => void;
  onSortTokensChange: (tokens: SortToken[]) => void;
};

const columnHelper = createColumnHelper<ClinicalTrial>();

export default function SearchResultsTable({
  data,
  querystring,
  totalCount,
  displayColumns,
  selectedIds,
  onSelectedIdsChange,
  selectAllAcrossPages,
  onSelectAllAcrossPages,
  onClearSelection,
  onSortTokensChange,
}: Props) {
  const visibleIds = useMemo(
    () => data.map((d) => d.protocolSection.identificationModule.nctId),
    [data],
  );

  const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

  // Persist selection to localStorage
  useEffect(() => {
    if (selectedIds.length > 0) {
      localStorage.setItem("selectedNctIds", JSON.stringify(selectedIds));
    } else {
      localStorage.removeItem("selectedNctIds");
    }
  }, [selectedIds]);

  const handleToggleAllVisible = (checked: boolean) => {
    if (checked) {
      const updated = Array.from(new Set([...selectedIds, ...visibleIds]));
      onSelectedIdsChange(updated);
    } else {
      const updated = selectedIds.filter((id) => !visibleIds.includes(id));
      onSelectedIdsChange(updated);
    }
  };

  const handleToggleRow = (id: string) => {
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((nctId) => nctId !== id)
        : [...selectedIds, id],
    );
  };

  // Sorting logic
  const [sortTokens, setSortTokens] = useState<SortToken[]>([]);
  useEffect(() => {
    const query = qs.parse(querystring, { ignoreQueryPrefix: true });
    if (typeof query.sort === "string") {
      const parsed = query.sort.split(",").map((s) => {
        const [field, dir] = s.split(":");
        return { field, direction: dir as "asc" | "desc" };
      });
      setSortTokens(parsed);
    }
  }, [querystring]);

  const toggleSort = useCallback(
    (field: string) => {
      const existing = sortTokens.find((t) => t.field === field);
      let newTokens = [...sortTokens];

      if (!existing) {
        newTokens.push({ field, direction: "asc" });
      } else {
        newTokens = newTokens.map((t) =>
          t.field === field
            ? {
                ...t,
                direction: t.direction === "asc" ? "desc" : "asc",
              }
            : t,
        );
      }

      onSortTokensChange(newTokens);
    },
    [sortTokens, onSortTokensChange],
  );

  const renderSortableHeader = useCallback(
    (field: string, label: string) => {
      const token = sortTokens.find((t) => t.field === field);
      const icon =
        token?.direction === "asc" ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : token?.direction === "desc" ? (
          <ChevronDown className="ml-1 h-4 w-4" />
        ) : null;

      return (
        <div
          onClick={() => toggleSort(field)}
          className="flex cursor-pointer items-center select-none"
        >
          {label}
          {icon}
        </div>
      );
    },
    [sortTokens, toggleSort],
  );

  const allColumns = useMemo(() => {
    const cols = [];

    if (displayColumns.includes("selection")) {
      cols.push(
        columnHelper.display({
          id: "selection",
          header: () => (
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) =>
                handleToggleAllVisible(Boolean(checked))
              }
              ref={(el) => {
                if (el)
                  el.indeterminate = someVisibleSelected && !allVisibleSelected;
              }}
              aria-label="Select all studies on this page"
            />
          ),
          cell: ({ row }) => {
            const nctId =
              row.original.protocolSection.identificationModule.nctId;
            return (
              <Checkbox
                checked={selectedIds.includes(nctId)}
                onCheckedChange={() => handleToggleRow(nctId)}
                aria-label={`Select study ${nctId}`}
              />
            );
          },
        }),
      );
    }

    const colDefs = [
      {
        id: "nctId",
        label: "NCT ID",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.identificationModule.nctId,
        cell: (val: string) => (
          <Link
            href={`/clinical-trials/${val}`}
            className="text-blue-600 hover:underline"
          >
            {val}
          </Link>
        ),
      },
      {
        id: "briefTitle",
        label: "Title",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.identificationModule.briefTitle,
      },
      {
        id: "organization",
        label: "Sponsor / Organization",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.identificationModule.organization.fullName,
      },
      {
        id: "status",
        label: "Status",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.statusModule.overallStatus,
      },
      {
        id: "conditions",
        label: "Conditions",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.conditionsModule?.conditions?.join(", ") || "",
      },
      {
        id: "startDate",
        label: "Start Date",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.statusModule.startDateStruct?.date,
      },
      {
        id: "completionDate",
        label: "Completion Date",
        accessor: (row: ClinicalTrial) =>
          row.protocolSection.statusModule.completionDateStruct?.date,
      },
    ];

    colDefs.forEach(({ id, label, accessor, cell }) => {
      if (displayColumns.includes(id)) {
        cols.push(
          columnHelper.accessor(accessor, {
            id,
            header: () => renderSortableHeader(id, label),
            cell: cell
              ? ({ getValue }) => cell(getValue() || "")
              : ({ getValue }) => getValue() || "-",
          }),
        );
      }
    });

    return cols;
  }, [
    displayColumns,
    selectedIds,
    allVisibleSelected,
    someVisibleSelected,
    handleToggleAllVisible,
    handleToggleRow,
    renderSortableHeader,
  ]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedCount = selectedIds.length;
  const visibleCount = visibleIds.length;

  return (
    <div className="mt-6">
      {selectedCount > 0 && (
        <div className="text-muted-foreground mb-2 flex items-center justify-between rounded-md border px-4 py-2 text-sm">
          {selectAllAcrossPages ? (
            <>
              <span>
                {selectedCount.toLocaleString()} selected across{" "}
                {totalCount.toLocaleString()} results.
              </span>
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600"
                onClick={onClearSelection}
              >
                Clear selection
              </Button>
            </>
          ) : (
            <>
              <span>
                {`${Math.min(selectedCount, visibleCount)}–${totalCount.toLocaleString()} selected.`}
              </span>
              {totalCount > visibleCount && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600"
                  onClick={onSelectAllAcrossPages}
                >
                  Select all {totalCount.toLocaleString()} studies
                </Button>
              )}
            </>
          )}
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
