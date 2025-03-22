"use client";

import { useEffect, useState, useMemo } from "react";
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
  // filters: FilterToken[];
  onFiltersCommitted: (filters: FilterToken[]) => void;
  queryString: string;
  // updateQueryString: (newQueryString: string) => void;
}

export default function GuidedFilterBar({
  onFiltersCommitted,
  queryString,
  // updateQueryString,
}: GuidedFilterBarProps) {
  const [selectedField, setSelectedField] = React.useState<string>("");
  const [selectedValue, setSelectedValue] = React.useState<string>("");
  const baseQueryObject = useMemo(() => {
    return qs.parse(queryString, { ignoreQueryPrefix: true });
  }, [queryString]);

  const filterTokens: FilterToken[] = React.useMemo(() => {
    if (
      typeof baseQueryObject.filter === "object" &&
      baseQueryObject.filter !== null
    ) {
      return Object.entries(baseQueryObject.filter).map(([field, value]) => ({
        field,
        value: String(value),
      }));
    }
    return [];
  }, [baseQueryObject]);

  // Get list of filterable fields from filterEnumMap keys
  // const fields = Object.keys(filterEnumMap);
  const fields = React.useMemo(() => {
    const usedFields = new Set(filterTokens.map((t) => t.field));
    return Object.keys(filterEnumMap)
      .filter((field) => !usedFields.has(field))
      .sort((a, b) => a.localeCompare(b));
  }, [filterTokens]);

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
    const updatedFilters = filterTokens.filter(
      (f) => f.field !== selectedField,
    );
    updatedFilters.push(newToken);
    // onFiltersChange(updatedFilters);

    // Update query string correctly **without duplicating existing filters**
    // const queryObject = qs.parse(queryString);
    const queryObject = { ...baseQueryObject };
    const updatedQuery = {
      ...queryObject,
    };

    if (updatedFilters.length > 0) {
      updatedQuery.filter = {};
      updatedFilters.forEach((token) => {
        if (!updatedQuery.filter) return;
        updatedQuery.filter[token.field] = token.value;
      });
    } else {
      delete updatedQuery.filter;
    }

    console.log("GuidedFilterBar - Adding filter:", updatedQuery);
    onFiltersCommitted(updatedFilters);

    setSelectedField("");
    setSelectedValue("");
  };

  const removeFilter = (field: string) => {
    const updatedFilters = filterTokens.filter((f) => f.field !== field);

    // Ensure filter is properly removed from URL
    // const queryObject = qs.parse(queryString);
    const queryObject = { ...baseQueryObject };
    if (queryObject.filter) {
      delete queryObject.filter[field];
      if (Object.keys(queryObject.filter).length === 0) {
        delete queryObject.filter; // Remove empty filter object
      }
    }
    console.log("GuidedFilterBar - Removing filter:", updatedFilters);
    onFiltersCommitted(updatedFilters);
    // updateQueryString(qs.stringify(queryObject));
  };

  const clearAll = () => {
    onFiltersCommitted([]);
    // updateQueryString(qs.stringify(queryObject));
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Section to add a new filter */}
      <div className="flex items-center space-x-2">
        <select
          value={selectedField}
          onChange={handleFieldChange}
          className="rounded border border-gray-300 px-2 py-1"
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
            className="rounded border border-gray-300 px-2 py-1"
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
          className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
        >
          Add Filter
        </button>
      </div>

      {/* Display current filter tokens */}
      <div className="flex flex-wrap gap-2">
        {Array.isArray(filterTokens) &&
          filterTokens.map((token) => (
            <div
              key={token.field}
              className="flex items-center rounded bg-gray-200 px-2 py-1"
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

      {Array.isArray(filterTokens) && filterTokens.length > 0 && (
        <button
          onClick={clearAll}
          className="self-start text-sm text-blue-600 underline"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
