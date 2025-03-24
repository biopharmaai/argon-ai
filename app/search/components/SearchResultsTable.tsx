"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import qs from "qs";
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
import { ClinicalTrial } from "@/types/clinicalTrials";
import { SortToken } from "@/app/search/components/GuidedSortBar";
import { columnsDefinitions } from "@/lib/constants";

type Props = {
  data: ClinicalTrial[];
  querystring: string;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onSortTokensChange: (tokens: SortToken[]) => void;
};

const columnHelper = createColumnHelper<ClinicalTrial>();

export default function SearchResultsTable({
  data,
  querystring,
  selectedIds,
  onSelectedIdsChange,
  onSortTokensChange,
}: Props) {
  const visibleIds = useMemo(
    () => data.map((d) => d.protocolSection.identificationModule.nctId),
    [data],
  );

  const displayColumns = useMemo(() => {
    const query = qs.parse(querystring, { ignoreQueryPrefix: true });
    return [
      "selection",
      ...(typeof query.fields === "string" ? query.fields.split(",") : []),
    ];
  }, [querystring]);

  const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

  useEffect(() => {
    if (selectedIds.length > 0) {
      localStorage.setItem("selectedNctIds", JSON.stringify(selectedIds));
    } else {
      localStorage.removeItem("selectedNctIds");
    }
  }, [selectedIds]);

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      const updated = checked
        ? Array.from(new Set([...selectedIds, ...visibleIds]))
        : selectedIds.filter((id) => !visibleIds.includes(id));
      onSelectedIdsChange(updated);
    },
    [selectedIds, visibleIds, onSelectedIdsChange],
  );

  const handleToggleRow = useCallback(
    (id: string) => {
      onSelectedIdsChange(
        selectedIds.includes(id)
          ? selectedIds.filter((nctId) => nctId !== id)
          : [...selectedIds, id],
      );
    },
    [selectedIds, onSelectedIdsChange],
  );

  const [sortTokens, setSortTokens] = useState<SortToken[]>([]);
  useEffect(() => {
    const query = qs.parse(querystring, { ignoreQueryPrefix: true });
    if (typeof query.sort === "string") {
      const parsed = query.sort.split(",").map((s) => {
        const [field, dir] = s.split(":");
        return { field, direction: dir as "asc" | "desc" };
      });
      setSortTokens(parsed);
    } else {
      setSortTokens([]);
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
                if (el instanceof HTMLInputElement) {
                  el.indeterminate = someVisibleSelected && !allVisibleSelected;
                }
              }}
              aria-label="Select all studies on this page"
              className="bg-white"
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
                className="bg-white"
              />
            );
          },
        }),
      );
    }

    displayColumns.forEach((id) => {
      if (id === "selection") return;
      const def = columnsDefinitions.find((col) => col.id === id);
      if (def) {
        const { label, accessor, cell } = def;
        cols.push(
          columnHelper.accessor(accessor, {
            id,
            header: () => (
              <div className={def.meta?.className}>
                {renderSortableHeader(id, label)}
              </div>
            ),
            cell: cell
              ? ({ getValue }) => (
                  <div className={def.meta?.className}>
                    {cell(String(getValue()) || "")}
                  </div>
                )
              : ({ getValue }) => (
                  <div className={def.meta?.className}>{getValue() || "-"}</div>
                ),
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

  return (
    <div className="w-full overflow-x-auto px-6">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-white">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="bg-white hover:bg-white">
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
