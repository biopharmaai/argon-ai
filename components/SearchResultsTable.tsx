"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { ClinicalTrial } from "@/types/clinicalTrials";

const columnHelper = createColumnHelper<ClinicalTrial>();

// Define the columns to display key fields for Sarah's research needs
const columns = [
  columnHelper.accessor(
    (row) => row.protocolSection.identificationModule.nctId,
    {
      id: "nctId",
      header: "Trial ID",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection.identificationModule.briefTitle,
    {
      id: "briefTitle",
      header: "Title",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection.identificationModule.organization.fullName,
    {
      id: "organization",
      header: "Sponsor / Organization",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection.statusModule.overallStatus,
    {
      id: "status",
      header: "Status",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection.conditionsModule?.conditions,
    {
      id: "conditions",
      header: "Conditions",
      cell: (info) => {
        if (!info.getValue()) return null;
        (info.getValue() as string[]).join(", ");
      },
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection.statusModule.startDateStruct?.date,
    {
      id: "startDate",
      header: "Start Date",
      cell: (info) => info.getValue(),
    },
  ),
  columnHelper.accessor(
    (row) => row.protocolSection?.statusModule.completionDateStruct?.date,
    {
      id: "completionDate",
      header: "Completion Date",
      cell: (info) => info.getValue(),
    },
  ),
];

type ClinicalTrialsTableProps = {
  data: ClinicalTrial[];
};

export default function SearchResultsTable({ data }: ClinicalTrialsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="min-w-full border-collapse">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-4 py-2 border-b text-left">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-2 border-b">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
