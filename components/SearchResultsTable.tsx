"use client";

import React, { useMemo } from "react";
import qs from "qs";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";

// Shadcn UI table components – adjust the import paths as needed
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import type { ClinicalTrial } from "@/types/clinicalTrials";

export type SearchResultsTableProps = {
  data: ClinicalTrial[];
  queryString: string;
  setQueryString: (newQS: string) => void;
  displayColumns: string[]; // Array of column IDs to display, in order.
};

export default function SearchResultsTable({
  data,
  queryString,
  setQueryString,
  displayColumns,
}: SearchResultsTableProps) {
  const columnHelper = createColumnHelper<ClinicalTrial>();

  const hasMountedRef = React.useRef(false); // Added hasMountedRef

  /**
   * This function toggles the sort state for a given field in the query string.
   * It cycles through:
   *   no sort → asc → desc → no sort (removes field).
   */
  function toggleSort(field: string, queryStringValue: string) {
    const q = qs.parse(queryStringValue);
    const currentSort = (q.sort as string) || "";
    const currentItems = currentSort
      ? currentSort.split(",").filter(Boolean)
      : [];

    const index = currentItems.findIndex(
      (item) => item.split(":")[0] === field
    );

    if (index === -1) {
      // Field not present: add it as ascending
      currentItems.push(`${field}:asc`);
    } else {
      const [_, direction] = currentItems[index].split(":");
      if (direction === "asc") {
        currentItems[index] = `${field}:desc`;
      } else if (direction === "desc") {
        currentItems.splice(index, 1);
      }
    }

    if (currentItems.length > 0) {
      q.sort = currentItems.join(",");
    } else {
      delete q.sort;
    }

    console.log("SearchResultsTable - Toggling sort:", q);
    setQueryString(qs.stringify(q));
  }
  /**
   * Helper to render a sortable header.
   * It reads the current sort state from the query string,
   * displays the correct icon, and calls toggleSort on click.
   */
  const renderSortableHeader = (field: string, label: string) => {
    // Parse the current query string for sort information.
    const query = qs.parse(queryString);
    const currentSort: string = (query.sort as string) || "";
    const sortItems = currentSort ? currentSort.split(",").filter(Boolean) : [];

    // Determine if this field is currently sorted and how.
    let sortDirection: "asc" | "desc" | null = null;
    for (const item of sortItems) {
      const [f, d] = item.split(":");
      if (f === field) {
        sortDirection = d === "desc" ? "desc" : "asc";
        break;
      }
    }

    // Pick the correct icon
    let icon = null;
    if (sortDirection === "asc") {
      icon = <ChevronUp className="ml-1 h-4 w-4" />;
    } else if (sortDirection === "desc") {
      icon = <ChevronDown className="ml-1 h-4 w-4" />;
    }

    return (
      <div
        className="flex items-center cursor-pointer select-none"
        onClick={() => toggleSort(field, queryString)}
      >
        <span>{label}</span>
        {icon}
      </div>
    );
  };

  // Define all possible columns
  const allColumns = useMemo(
    () => [
      // Selection column (non-sortable)
      columnHelper.display({
        id: "selection",
        header: () => (
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>#</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>{row.index + 1}</span>
          </div>
        ),
      }),
      // NCT ID column with Link and sortable header
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.nctId,
        {
          id: "nctId",
          header: () => renderSortableHeader("nctId", "NCT ID"),
          cell: (info) => {
            const nctId = info.getValue();
            return (
              <Link
                href={`/clinical-trials/${nctId}`}
                className="text-blue-600 hover:underline"
              >
                {nctId}
              </Link>
            );
          },
        },
      ),
      // Title column (with constrained width)
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.briefTitle,
        {
          id: "briefTitle",
          header: () => renderSortableHeader("briefTitle", "Title"),
          cell: (info) => (
            <div className="max-w-[200px] truncate" title={info.getValue()}>
              {info.getValue()}
            </div>
          ),
        },
      ),
      // Organization column
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.organization.fullName,
        {
          id: "organization",
          header: () =>
            renderSortableHeader("organization", "Sponsor / Organization"),
          cell: (info) => info.getValue(),
        },
      ),
      // Status column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.overallStatus,
        {
          id: "status",
          header: () => renderSortableHeader("status", "Status"),
          cell: (info) => info.getValue(),
        },
      ),
      // Conditions column
      columnHelper.accessor(
        (row) => row.protocolSection.conditionsModule?.conditions,
        {
          id: "conditions",
          header: () => renderSortableHeader("conditions", "Conditions"),
          cell: (info) => {
            const conditionsArr = info.getValue() as string[];
            const conditions = conditionsArr ? conditionsArr.join(", ") : "";
            return <div className="max-w-2xl truncate">{conditions}</div>;
          },
        },
      ),
      // Start Date column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.startDateStruct?.date,
        {
          id: "startDate",
          header: () => renderSortableHeader("startDate", "Start Date"),
          cell: (info) => info.getValue(),
        },
      ),
      // Completion Date column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.completionDateStruct?.date,
        {
          id: "completionDate",
          header: () =>
            renderSortableHeader("completionDate", "Completion Date"),
          cell: (info) => info.getValue(),
        },
      ),
    ],
    [columnHelper, queryString],
  );

  // Filter to only include columns that are enabled.
  const columns = useMemo(() => {
    return allColumns.filter((col) => displayColumns.includes(col.id));
  }, [allColumns, displayColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
  );
}

SearchResultsTable.displayName = "SearchResultsTable";
