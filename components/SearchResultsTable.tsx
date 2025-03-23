"use client";

import React, { useMemo, useEffect, useState, useCallback } from "react";
import qs from "qs";
import Link from "next/link";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { SortToken } from "@/components/GuidedSortBar";
import JSZip from "jszip";

type Props = {
  data: ClinicalTrial[];
  querystring: string;
  totalCount: number;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  selectAllAcrossPages: boolean;
  onSelectAllAcrossPages: () => void;
  onClearSelection: () => void;
  onSortTokensChange: (tokens: SortToken[]) => void;
};

const columnHelper = createColumnHelper<ClinicalTrial>();
export const columnsDefinitions = [
  {
    id: "nctId",
    label: "NCT ID",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.identificationModule.nctId,
    cell: (val: string) => (
      <Link href={`/study/${val}`} className="text-blue-600 hover:underline">
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
  {
    id: "officialTitle",
    label: "Official Title",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.identificationModule.officialTitle || "",
  },
  {
    id: "briefSummary",
    label: "Brief Summary",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.descriptionModule.briefSummary || "",
  },
  {
    id: "leadSponsor",
    label: "Lead Sponsor",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.sponsorCollaboratorsModule.leadSponsor.name || "",
  },
  {
    id: "primaryOutcomeMeasure",
    label: "Primary Outcome Measure",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.outcomesModule.primaryOutcomes?.[0]?.measure || "",
  },
  {
    id: "enrollmentCount",
    label: "Enrollment Count",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.designModule.enrollmentInfo?.count || "",
  },
  {
    id: "studyType",
    label: "Study Type",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.designModule.studyType || "",
  },
  {
    id: "sex",
    label: "Sex",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.sex || "",
  },
  {
    id: "minimumAge",
    label: "Minimum Age",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.minimumAge || "",
  },
  {
    id: "maximumAge",
    label: "Maximum Age",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.maximumAge || "",
  },
  {
    id: "locations",
    label: "Locations",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.contactsLocationsModule.locations
        ?.map((loc) => loc.facility)
        .join(", ") || "",
  },
];

export default function SearchResultsTable({
  data,
  querystring,
  totalCount,
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
  const displayColumns = useMemo(() => {
    const query = qs.parse(querystring, { ignoreQueryPrefix: true });
    return [
      "selection",
      ...(typeof query.fields === "string" ? query.fields.split(",") : []),
    ];
  }, [querystring]);

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

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      if (checked) {
        const updated = Array.from(new Set([...selectedIds, ...visibleIds]));
        onSelectedIdsChange(updated);
      } else {
        const updated = selectedIds.filter((id) => !visibleIds.includes(id));
        onSelectedIdsChange(updated);
      }
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
            header: () => renderSortableHeader(id, label),
            cell: cell
              ? ({ getValue }) => cell(String(getValue()) || "")
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

  // Export modal state
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [zipEach, setZipEach] = useState(false);

  const handleDownload = async () => {
    const date = new Date().toISOString().split("T")[0];
    const selectedTrials = data.filter((d) =>
      selectedIds.includes(d.protocolSection.identificationModule.nctId),
    );

    if (zipEach) {
      const zip = new JSZip();

      for (const trial of selectedTrials) {
        const nctId = trial.protocolSection.identificationModule.nctId;
        const content =
          format === "json"
            ? JSON.stringify(trial, null, 2)
            : toCsv([trial], displayColumns);
        zip.file(`${nctId}.${format}`, content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `${date}-study-${format}.zip`);
    } else {
      const content =
        format === "json"
          ? JSON.stringify(selectedTrials, null, 2)
          : toCsv(selectedTrials, displayColumns);
      const blob = new Blob([content], {
        type:
          format === "json" ? "application/json" : "text/csv;charset=utf-8;",
      });
      triggerDownload(blob, `${date}-study.${format}`);
    }

    setOpen(false);
  };

  const toCsv = (rows: ClinicalTrial[], columns: string[]) => {
    const header = columns.join(",");
    const body = rows
      .map((trial) =>
        columns
          .map((col) => {
            const val =
              col === "nctId"
                ? trial.protocolSection.identificationModule.nctId
                : col === "briefTitle"
                  ? trial.protocolSection.identificationModule.briefTitle
                  : col === "organization"
                    ? trial.protocolSection.identificationModule.organization
                        .fullName
                    : col === "status"
                      ? trial.protocolSection.statusModule.overallStatus
                      : col === "conditions"
                        ? trial.protocolSection.conditionsModule?.conditions?.join(
                            "|",
                          )
                        : col === "startDate"
                          ? trial.protocolSection.statusModule.startDateStruct
                              ?.date
                          : col === "completionDate"
                            ? trial.protocolSection.statusModule
                                .completionDateStruct?.date
                            : "";
            return `"${(val || "").replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    return `${header}\n${body}`;
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div className="mb-2 flex min-h-[2rem] items-center justify-between gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={selectedIds.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        {selectedIds.length > 0 && (
          <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-sm">
            {selectAllAcrossPages ? (
              <span>
                {selectedIds.length.toLocaleString()} selected across{" "}
                {totalCount.toLocaleString()} results.
              </span>
            ) : (
              <span>
                {`${Math.min(
                  selectedIds.length,
                  visibleIds.length,
                )}–${totalCount.toLocaleString()} selected.`}
              </span>
            )}
            <Button
              variant="link"
              className="h-auto p-0 text-blue-600"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
            {selectedIds.length !== totalCount && (
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600"
                onClick={onSelectAllAcrossPages}
              >
                Select all {totalCount.toLocaleString()} studies
              </Button>
            )}
          </div>
        )}
      </div>

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Selected Clinical Studies</DialogTitle>
            <DialogDescription>
              Choose your export format and whether to zip the results.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={format}
              onValueChange={(val: "csv" | "json") => setFormat(val)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
            </RadioGroup>
            {selectedIds.length > 1 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="zipEach"
                  checked={zipEach}
                  onCheckedChange={(checked) => setZipEach(Boolean(checked))}
                />
                <Label htmlFor="zipEach">
                  Put each study into its own file and zip
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDownload}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
