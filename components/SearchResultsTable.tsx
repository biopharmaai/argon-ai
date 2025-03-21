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

  // All possible columns
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
      // NCT ID column with Link and sorting
      columnHelper.accessor(
        (row) => row.protocolSection.identificationModule.nctId,
        {
          id: "nctId",
          header: () => (
            <div className="flex items-center cursor-pointer select-none">
              <span>NCT ID</span>
              <ChevronUp className="ml-1 h-4 w-4" />
            </div>
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
          header: () => <div className="select-none">Title</div>,
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
          header: () => (
            <div className="select-none">Sponsor / Organization</div>
          ),
          cell: (info) => info.getValue(),
        },
      ),
      // Status column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.overallStatus,
        {
          id: "status",
          header: () => <div className="select-none">Status</div>,
          cell: (info) => info.getValue(),
        },
      ),
      // Conditions column
      columnHelper.accessor(
        (row) => row.protocolSection.conditionsModule?.conditions,
        {
          id: "conditions",
          header: () => <div className="select-none">Conditions</div>,
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
          header: () => <div className="select-none">Start Date</div>,
          cell: (info) => info.getValue(),
        },
      ),
      // Completion Date column
      columnHelper.accessor(
        (row) => row.protocolSection.statusModule.completionDateStruct?.date,
        {
          id: "completionDate",
          header: () => <div className="select-none">Completion Date</div>,
          cell: (info) => info.getValue(),
        },
      ),
    ],
    [columnHelper],
  );

  // Filter to only include columns that are enabled in displayColumns.
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
