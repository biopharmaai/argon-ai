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

// -----------------------
// Reusable SortableHeader component
// -----------------------

interface SortableHeaderProps {
  field: string;
  label: string;
  queryString: string;
  setQueryString: (newQS: string) => void;
}

function SortableHeader({
  field,
  label,
  queryString,
  setQueryString,
}: SortableHeaderProps) {
  // Parse the current sort information from the query string.
  const query = qs.parse(queryString);
  const currentSort: string = (query.sort as string) || "";
  const sortItems = currentSort ? currentSort.split(",") : [];
  const sortItem = sortItems.find((s) => s.split(":")[0] === field);
  const sortDirection = sortItem ? sortItem.split(":")[1] : "asc";

  // When clicked, toggle the sort order for the field.
  const handleSortToggle = () => {
    const query = qs.parse(queryString);
    const currentSort: string = (query.sort as string) || "";
    const sortItems = currentSort ? currentSort.split(",") : [];
    let found = false;
    const newSortItems = sortItems.map((item) => {
      const [key, direction] = item.split(":");
      if (key === field) {
        found = true;
        return `${key}:${direction === "asc" ? "desc" : "asc"}`;
      }
      return item;
    });
    if (!found) {
      // Field not present – default was ascending; toggle to descending.
      newSortItems.push(`${field}:desc`);
    }
    query.sort = newSortItems.join(",");
    const newQS = qs.stringify(query);
    setQueryString(newQS);
  };

  return (
    <div
      className="flex items-center cursor-pointer select-none"
      onClick={handleSortToggle}
    >
      <span>{label}</span>
      {sortDirection === "asc" ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </div>
  );
}
SortableHeader.displayName = "SortableHeader";

// Helper to generate a header function for sortable columns.
const getSortableHeader =
  (
    field: string,
    label: string,
    queryString: string,
    setQueryString: (newQS: string) => void,
  ) =>
  () => (
    <SortableHeader
      field={field}
      label={label}
      queryString={queryString}
      setQueryString={setQueryString}
    />
  );

// -----------------------
// Table Component
// -----------------------

export type SearchResultsTableProps = {
  data: ClinicalTrial[];
  queryString: string;
  setQueryString: (newQS: string) => void;
};

export default function SearchResultsTable({
  data,
  queryString,
  setQueryString,
}: SearchResultsTableProps) {
  // Create the column helper
  const columnHelper = createColumnHelper<ClinicalTrial>();

  // Declare columns inside a useMemo so they update when queryString changes.
  const columns = useMemo(
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
      // NCT ID column with Link and sorting
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.nctId,
        {
          id: "nctId",
          header: getSortableHeader(
            "nctId",
            "NCT ID",
            queryString,
            setQueryString,
          ),
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
          header: getSortableHeader(
            "briefTitle",
            "Title",
            queryString,
            setQueryString,
          ),
          cell: (info) => (
            <div className="max-w-[200px] truncate" title={info.getValue()}>
              {" "}
              {info.getValue()}{" "}
            </div>
          ),
        },
      ),
      // Organization column
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.organization.fullName,
        {
          id: "organization",
          header: getSortableHeader(
            "organization",
            "Sponsor / Organization",
            queryString,
            setQueryString,
          ),
          cell: (info) => info.getValue(),
        },
      ),
      // Status column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.overallStatus,
        {
          id: "status",
          header: getSortableHeader(
            "status",
            "Status",
            queryString,
            setQueryString,
          ),
          cell: (info) => info.getValue(),
        },
      ),
      // Conditions column
      columnHelper.accessor(
        (row) => row.protocolSection.conditionsModule?.conditions,
        {
          id: "conditions",
          header: getSortableHeader(
            "conditions",
            "Conditions",
            queryString,
            setQueryString,
          ),
          cell: (info) => {
            const _conditions = info.getValue() as string[];

            const conditions = _conditions ? _conditions.join(", ") : "";

            return <div className="max-w-2xl truncate">{conditions}</div>;
          },
        },
      ),
      // Start Date column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.startDateStruct?.date,
        {
          id: "startDate",
          header: getSortableHeader(
            "startDate",
            "Start Date",
            queryString,
            setQueryString,
          ),
          cell: (info) => info.getValue(),
        },
      ),
      // Completion Date column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.completionDateStruct?.date,
        {
          id: "completionDate",
          header: getSortableHeader(
            "completionDate",
            "Completion Date",
            queryString,
            setQueryString,
          ),
          cell: (info) => info.getValue(),
        },
      ),
    ],
    [columnHelper, queryString, setQueryString],
  );

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
