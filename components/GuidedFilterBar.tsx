// File: /components/GuidedFilterBar.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { filterEnumMap } from "@/types/filterEnums"; // adjust path if needed

// A filter token representing a single filter, e.g. { field: "overallStatus", value: "RECRUITING" }
export interface FilterToken {
  field: string;
  value: string;
}

interface GuidedFilterBarProps {
  filters: FilterToken[];
  onFiltersChange: (filters: FilterToken[]) => void;
}

export default function GuidedFilterBar({
  filters,
  onFiltersChange,
}: GuidedFilterBarProps) {
  const [selectedField, setSelectedField] = React.useState<string>("");
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  // Get list of filterable fields from filterEnumMap keys
  const fields = Object.keys(filterEnumMap);

  // When field changes, clear the value
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const field = e.target.value;
    setSelectedField(field);
    setSelectedValue("");
  };

  // Add the filter token if both field and value are selected
  const addFilter = () => {
    if (!selectedField || !selectedValue) return;
    const newToken: FilterToken = {
      field: selectedField,
      value: selectedValue,
    };
    // Prevent duplicates
    if (
      !filters.some(
        (token) =>
          token.field === selectedField && token.value === selectedValue,
      )
    ) {
      onFiltersChange([...filters, newToken]);
    }
    setSelectedField("");
    setSelectedValue("");
  };

  const removeFilter = (index: number) => {
    const updated = filters.filter((_, i) => i !== index);
    onFiltersChange(updated);
  };

  const clearAll = () => {
    onFiltersChange([]);
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
        {filters.map((token, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-200 rounded px-2 py-1"
          >
            <span className="text-sm">
              {token.field}: {token.value}
            </span>
            <button
              onClick={() => removeFilter(index)}
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
