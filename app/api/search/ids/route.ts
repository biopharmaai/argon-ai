// File: /app/api/search/nctids/route.ts

import { NextResponse } from "next/server";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { filterEnumMap } from "@/types/filterEnums";
import _data from "@/ctg-studies.json";
import Fuse from "fuse.js";

// Cast data
const data = _data as ClinicalTrial[];

function getSortValue(trial: ClinicalTrial, field: string): string {
  switch (field) {
    case "nctId":
      return trial.protocolSection.identificationModule.nctId || "";
    case "briefTitle":
      return trial.protocolSection.identificationModule.briefTitle || "";
    case "organization":
      return (
        trial.protocolSection.identificationModule.organization.fullName || ""
      );
    case "status":
      return trial.protocolSection.statusModule.overallStatus || "";
    case "startDate":
      return trial.protocolSection.statusModule.startDateStruct?.date || "";
    case "completionDate":
      return (
        trial.protocolSection.statusModule.completionDateStruct?.date || ""
      );
    default:
      return "";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const term = searchParams.get("term")?.toLowerCase() || "";

  // Parse sort
  const sortParam = searchParams.get("sort") || "";
  const sortItems = sortParam
    ? sortParam.split(",").map((item) => {
        const [field, direction] = item.split(":");
        return { field, direction: direction || "asc" };
      })
    : [];
  const effectiveSortItems = sortItems.filter(
    (item) => item.field !== "conditions",
  );

  // Parse filters
  const filters: { [key: string]: string } = {};
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match) {
      const filterField = match[1];
      filters[filterField] = value.toLowerCase();
    }
  }

  // Fuzzy filter
  const fuseOptions = {
    keys: [
      "protocolSection.identificationModule.briefTitle",
      "protocolSection.conditionsModule.conditions",
      "protocolSection.conditionsModule.keywords",
    ],
    threshold: 0.4,
    includeScore: true,
  };

  let filteredData: ClinicalTrial[] = [];
  if (term) {
    const fuse = new Fuse(data, fuseOptions);
    const fuseResults = fuse.search(term);
    filteredData = fuseResults.map((result) => result.item);
  } else {
    filteredData = [...data];
  }

  // Apply explicit filters
  filteredData = filteredData.filter((trial) => {
    return Object.entries(filters).every(([field, filterValue]) => {
      const isEnumField = field in filterEnumMap;
      let actualValue: string | undefined = "";

      switch (field) {
        case "overallStatus":
          actualValue = trial.protocolSection.statusModule.overallStatus;
          break;
        case "studyType":
          actualValue = trial.protocolSection.designModule?.studyType;
          break;
        case "nctId":
          actualValue = trial.protocolSection.identificationModule.nctId;
          break;
        case "briefTitle":
          actualValue = trial.protocolSection.identificationModule.briefTitle;
          break;
        case "organization":
          actualValue =
            trial.protocolSection.identificationModule.organization.fullName;
          break;
        case "startDate":
          actualValue =
            trial.protocolSection.statusModule.startDateStruct?.date;
          break;
        case "completionDate":
          actualValue =
            trial.protocolSection.statusModule.completionDateStruct?.date;
          break;
        default:
          return true;
      }

      if (!actualValue) return false;

      const normalizedActual = actualValue.toLowerCase();

      return isEnumField
        ? normalizedActual === filterValue
        : normalizedActual.includes(filterValue);
    });
  });

  // Apply sorting (if any)
  if (effectiveSortItems.length > 0) {
    filteredData.sort((a, b) => {
      for (const sortItem of effectiveSortItems) {
        const aValue = getSortValue(a, sortItem.field);
        const bValue = getSortValue(b, sortItem.field);
        const cmp = aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (cmp !== 0) {
          return sortItem.direction === "asc" ? cmp : -cmp;
        }
      }
      return 0;
    });
  }

  // Extract all matching nctIds
  const matchingIds = filteredData.map(
    (trial) => trial.protocolSection.identificationModule.nctId,
  );

  return NextResponse.json({
    success: true,
    nctIds: matchingIds,
    totalCount: matchingIds.length,
  });
}
