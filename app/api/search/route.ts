// app/api/search/route.ts (for Next.js App Router)
import { NextResponse } from "next/server";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "../../../ctg-studies.json";

// Assert the JSON data as an array of ClinicalTrial
const data = _data as ClinicalTrial[];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Get the term and limit parameters
  const term = searchParams.get("term")?.toLowerCase() || "";
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 10;

  // Get the sort parameter in the format "field:direction"
  const sortParam = searchParams.get("sort") || "";
  let sortField = "";
  let sortDirection = "asc";
  if (sortParam) {
    const parts = sortParam.split(":");
    sortField = parts[0];
    sortDirection = parts[1] || "asc";
  }

  // Parse filter parameters that use bracket notation, e.g., filter[overallStatus]=RECRUITING
  const filters: { [key: string]: string } = {};
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filter\[(.+)\]$/);
    if (match) {
      const filterField = match[1];
      filters[filterField] = value.toLowerCase();
    }
  }

  // Filter the data
  let filteredData = data.filter((trial) => {
    let matchesTerm = true;
    if (term) {
      // Check term in conditions and keywords fields
      const conditionsStr = (
        trial.protocolSection.conditionsModule.conditions?.join(" ") || ""
      ).toLowerCase();
      const keywordsStr = (
        trial.protocolSection.conditionsModule.keywords?.join(" ") || ""
      ).toLowerCase();
      matchesTerm = conditionsStr.includes(term) || keywordsStr.includes(term);
    }

    // Apply filters based on the filter fields
    let matchesFilters = true;
    for (const [field, filterValue] of Object.entries(filters)) {
      if (field === "overallStatus") {
        if (
          trial.protocolSection.statusModule.overallStatus.toLowerCase() !==
          filterValue
        ) {
          matchesFilters = false;
          break;
        }
      } else if (field === "studyType") {
        if (
          trial.protocolSection.designModule.studyType.toLowerCase() !==
          filterValue
        ) {
          matchesFilters = false;
          break;
        }
      }
      // Add additional filter fields here as needed.
    }

    return matchesTerm && matchesFilters;
  });

  // Sort the data if a sort field is provided
  if (sortField) {
    filteredData.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "overallStatus") {
        aValue = a.protocolSection.statusModule.overallStatus;
        bValue = b.protocolSection.statusModule.overallStatus;
      } else if (sortField === "officialTitle") {
        aValue = a.protocolSection.identificationModule.officialTitle;
        bValue = b.protocolSection.identificationModule.officialTitle;
      } else if (sortField === "briefTitle") {
        aValue = a.protocolSection.identificationModule.briefTitle;
        bValue = b.protocolSection.identificationModule.briefTitle;
      }

      // For simplicity, we use localeCompare for string sorting
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }

  // Limit the number of results
  filteredData = filteredData.slice(0, limit);

  return NextResponse.json({ success: true, data: filteredData });
}
