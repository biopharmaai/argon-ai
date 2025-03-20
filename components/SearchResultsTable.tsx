"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Transition } from "@headlessui/react";
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
        const conditions = info.getValue() as string[];
        return conditions ? conditions.join(", ") : "";
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
    (row) => row.protocolSection.statusModule.completionDateStruct?.date,
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
    <div role="table" className="min-w-full border-collapse">
      {/* Header */}
      <div role="rowgroup" className="bg-gray-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <div role="row" key={headerGroup.id} className="flex">
            {headerGroup.headers.map((header) => (
              <div
                role="columnheader"
                key={header.id}
                className="px-4 py-2 border-b font-medium flex-1"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Body */}
      <div role="rowgroup">
        {table.getRowModel().rows.map((row) => (
          <Transition
            as="div"
            key={row.id}
            appear={true}
            show={true}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            role="row"
            className="flex"
          >
            {row.getVisibleCells().map((cell) => (
              <div
                role="cell"
                key={cell.id}
                className="px-4 py-2 border-b flex-1"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </Transition>
        ))}
      </div>
    </div>
  );
}
