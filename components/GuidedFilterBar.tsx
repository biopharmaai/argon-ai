"use client";

import * as React from "react";
import { X } from "lucide-react";
import { filterEnumMap } from "@/types/filterEnums"; // adjust path if needed
import qs from "qs";

// A filter token representing a single filter, e.g. { field: "overallStatus", value: "RECRUITING" }
export interface FilterToken {
  field: string;
  value: string;
}

interface GuidedFilterBarProps {
  filters: FilterToken[];
  onFiltersChange: (filters: FilterToken[]) => void;
  queryString: string;
  updateQueryString: (newQueryString: string) => void;
}

export default function GuidedFilterBar({
  filters,
  onFiltersChange,
  queryString,
  updateQueryString,
}: GuidedFilterBarProps) {
  const [selectedField, setSelectedField] = React.useState<string>("");
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  // Get list of filterable fields from filterEnumMap keys
  const fields = Object.keys(filterEnumMap);

  // Sync filter state with query string and ensure no duplicates
  React.useEffect(() => {
    const parsed = qs.parse(queryString);
    const filterParams = parsed.filter || {}; // Extract filters from URL

    const newFilters: FilterToken[] = [];
    for (const [field, value] of Object.entries(filterParams)) {
      if (typeof value === "string") {
        newFilters.push({ field, value });
      }
    }

    // Avoid unnecessary re-renders by checking if filters changed
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      onFiltersChange(newFilters);
    }
  }, [queryString]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
    setSelectedValue("");
  };

  const addFilter = () => {
    if (!selectedField || !selectedValue) return;

    const newToken: FilterToken = {
      field: selectedField,
      value: selectedValue,
    };

    // Ensure only one filter per field (overwrite existing)
    const updatedFilters = filters.filter((f) => f.field !== selectedField);
    updatedFilters.push(newToken);
    onFiltersChange(updatedFilters);

    // Update query string correctly **without duplicating existing filters**
    const queryObject = qs.parse(queryString);
    const updatedQuery = {
      ...queryObject,
    };

    if (updatedFilters.length > 0) {
      updatedQuery.filter = {};
      updatedFilters.forEach((token) => {
        updatedQuery.filter[token.field] = token.value;
      });
    } else {
      delete updatedQuery.filter;
    }
    
    console.log("GuidedFilterBar - Adding filter:", updatedQuery);
    updateQueryString(qs.stringify(updatedQuery));

    setSelectedField("");
    setSelectedValue("");
  };

  const removeFilter = (field: string) => {
    const updatedFilters = filters.filter((f) => f.field !== field);
    onFiltersChange(updatedFilters);

    // Ensure filter is properly removed from URL
    const queryObject = qs.parse(queryString);
    if (queryObject.filter) {
      delete queryObject.filter[field];
      if (Object.keys(queryObject.filter).length === 0) {
        delete queryObject.filter; // Remove empty filter object
      }
    }
    console.log("GuidedFilterBar - Removing filter:", queryObject);
    updateQueryString(qs.stringify(queryObject));
  };

  const clearAll = () => {
    onFiltersChange([]);
    const queryObject = qs.parse(queryString);
    delete queryObject.filter; // Remove all filters
    console.log("GuidedFilterBar - Clearing all filters:", queryObject);
    updateQueryString(qs.stringify(queryObject));
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Section to add a new filter */}
      <div className="flex items-center space-x-2">
        <select
          value={selectedField}
          onChange={handleFieldChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Select field...</option>
          {fields.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        {selectedField && (
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select value...</option>
            {(
              filterEnumMap[
                selectedField as keyof typeof filterEnumMap
              ] as string[]
            ).map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={addFilter}
          disabled={!selectedField || !selectedValue}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add Filter
        </button>
      </div>

      {/* Display current filter tokens */}
      <div className="flex flex-wrap gap-2">
        {filters.map((token) => (
          <div
            key={token.field}
            className="flex items-center bg-gray-200 rounded px-2 py-1"
          >
            <span className="text-sm">
              {token.field}: {token.value}
            </span>
            <button
              onClick={() => removeFilter(token.field)}
              className="ml-1"
              title="Remove filter"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {filters.length > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 underline self-start"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
