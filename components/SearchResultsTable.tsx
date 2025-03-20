"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { ClinicalTrial } from "@/types/clinicalTrials";

// Import shadcn UI table components (adjust the import path as needed)
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const columnHelper = createColumnHelper<ClinicalTrial>();

// First column: Checkbox with row number.
const selectionColumn = columnHelper.display({
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
});

// Second column: NCT ID with Link and sorting.
const nctIdColumn = columnHelper.accessor(
  (row) => row.protocolSection.identificationModule.nctId,
  {
    id: "nctId",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => column.toggleSorting()}
        >
          <span>NCT ID</span>
          {sorted === "asc" ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : sorted === "desc" ? (
            <ChevronDown className="ml-1 h-4 w-4" />
          ) : (
            // Default state: show ChevronUp in a muted color.
            <ChevronUp className="ml-1 h-4 w-4 text-gray-400" />
          )}
        </div>
      );
    },
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
);

const briefTitleColumn = columnHelper.accessor(
  (row) => row.protocolSection.identificationModule.briefTitle,
  {
    id: "briefTitle",
    header: "Title",
    cell: (info) => info.getValue(),
  },
);

const organizationColumn = columnHelper.accessor(
  (row) => row.protocolSection.identificationModule.organization.fullName,
  {
    id: "organization",
    header: "Sponsor / Organization",
    cell: (info) => info.getValue(),
  },
);

const statusColumn = columnHelper.accessor(
  (row) => row.protocolSection.statusModule.overallStatus,
  {
    id: "status",
    header: "Status",
    cell: (info) => info.getValue(),
  },
);

const conditionsColumn = columnHelper.accessor(
  (row) => row.protocolSection.conditionsModule?.conditions,
  {
    id: "conditions",
    header: "Conditions",
    cell: (info) => {
      const conditions = info.getValue() as string[];
      return conditions ? conditions.join(", ") : "";
    },
  },
);

const startDateColumn = columnHelper.accessor(
  (row) => row.protocolSection.statusModule.startDateStruct?.date,
  {
    id: "startDate",
    header: "Start Date",
    cell: (info) => info.getValue(),
  },
);

const completionDateColumn = columnHelper.accessor(
  (row) => row.protocolSection.statusModule.completionDateStruct?.date,
  {
    id: "completionDate",
    header: "Completion Date",
    cell: (info) => info.getValue(),
  },
);

const columns = [
  selectionColumn,
  nctIdColumn,
  briefTitleColumn,
  organizationColumn,
  statusColumn,
  conditionsColumn,
  startDateColumn,
  completionDateColumn,
];

type SearchResultsTableProps = {
  data: ClinicalTrial[];
};

export default function SearchResultsTable({ data }: SearchResultsTableProps) {
  // Initialize sorting with default sort on nctId ascending.
  const [sorting, setSorting] = useState([{ id: "nctId", desc: false }]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
