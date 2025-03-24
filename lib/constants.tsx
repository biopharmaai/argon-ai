import { ColumnConfig } from "@/types/columns";
import { ClinicalTrial } from "@/types/clinicalTrials";
import Link from "next/link";

const defaultColumnsIds = ["nctId", "briefTitle", "organization", "status"];

export const columnsDefinitions: ColumnConfig[] = [
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
    enabled: true,
  },
  {
    id: "briefTitle",
    label: "Title",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.identificationModule.briefTitle,
    enabled: true,
  },

  {
    id: "organization",
    label: "Sponsor / Organization",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.identificationModule.organization.fullName,
    enabled: true,
  },
  {
    id: "status",
    label: "Status",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.statusModule.overallStatus,
    enabled: true,
  },
  {
    id: "conditions",
    label: "Conditions",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.conditionsModule?.conditions?.join(", ") || "",
    enabled: false,
  },
  {
    id: "startDate",
    label: "Start Date",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.statusModule.startDateStruct?.date,
    enabled: false,
  },
  {
    id: "completionDate",
    label: "Completion Date",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.statusModule.completionDateStruct?.date,
    enabled: false,
  },
  {
    id: "officialTitle",
    label: "Official Title",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.identificationModule.officialTitle || "",
    enabled: false,
  },
  {
    id: "briefSummary",
    label: "Brief Summary",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.descriptionModule.briefSummary || "",
    enabled: false,
  },
  {
    id: "leadSponsor",
    label: "Lead Sponsor",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.sponsorCollaboratorsModule.leadSponsor.name || "",
    enabled: false,
  },
  {
    id: "primaryOutcomeMeasure",
    label: "Primary Outcome Measure",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.outcomesModule.primaryOutcomes?.[0]?.measure || "",
    enabled: false,
  },
  {
    id: "enrollmentCount",
    label: "Enrollment Count",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.designModule.enrollmentInfo?.count || "",
    enabled: false,
  },
  {
    id: "studyType",
    label: "Study Type",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.designModule.studyType || "",
    enabled: false,
  },
  {
    id: "sex",
    label: "Sex",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.sex || "",
    enabled: false,
  },
  {
    id: "minimumAge",
    label: "Minimum Age",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.minimumAge || "",
    enabled: false,
  },
  {
    id: "maximumAge",
    label: "Maximum Age",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.eligibilityModule.maximumAge || "",
    enabled: false,
  },
  {
    id: "locations",
    label: "Locations",
    accessor: (row: ClinicalTrial) =>
      row.protocolSection.contactsLocationsModule.locations
        ?.map((loc) => loc.facility)
        .join(", ") || "",
    enabled: false,
  },
];

export const defaultColumns: ColumnConfig[] = columnsDefinitions
  .filter((col) => defaultColumnsIds.includes(col.id))
  .map((col) => ({ ...col, enabled: true }));
// export const defaultColumns: ColumnConfig[] = [
//   {
//     id: "nctId",
//     label: "NCT ID",
//     accessor: (row) => row.protocolSection.identificationModule.nctId,
//     cell: (val) => val,
//     enabled: true,
//   },
//   {
//     id: "briefTitle",
//     label: "Title",
//     accessor: (row) => row.protocolSection.identificationModule.briefTitle,
//     cell: (val) => val,
//     enabled: true,
//   },
//   {
//     id: "organization",
//     label: "Sponsor / Organization",
//     accessor: (row) =>
//       row.protocolSection.identificationModule.organization.fullName,
//     cell: (val) => val,
//     enabled: true,
//   },
//   {
//     id: "status",
//     label: "Status",
//     accessor: (row) => row.protocolSection.statusModule.overallStatus,
//     cell: (val) => val,
//     enabled: true,
//   },
// ];
