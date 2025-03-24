import { ColumnConfig } from "@/types/columns";

export const defaultColumns: ColumnConfig[] = [
  {
    id: "nctId",
    label: "NCT ID",
    accessor: (row) => row.protocolSection.identificationModule.nctId,
    cell: (val) => val,
    enabled: true,
  },
  {
    id: "briefTitle",
    label: "Title",
    accessor: (row) => row.protocolSection.identificationModule.briefTitle,
    cell: (val) => val,
    enabled: true,
  },
  {
    id: "organization",
    label: "Sponsor / Organization",
    accessor: (row) =>
      row.protocolSection.identificationModule.organization.fullName,
    cell: (val) => val,
    enabled: true,
  },
  {
    id: "status",
    label: "Status",
    accessor: (row) => row.protocolSection.statusModule.overallStatus,
    cell: (val) => val,
    enabled: true,
  },
];
