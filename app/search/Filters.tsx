"use client";

import * as React from "react";
import { X } from "lucide-react";
import { filterEnumMap } from "@/types/filterEnums"; // Adjust the path as needed

// A filter token representing a single filter, e.g. { field: "overallStatus", value: "RECRUITING" }
export interface FilterToken {
  field: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterToken[];
  onFiltersChange: (filters: FilterToken[]) => void;
}

export default function FilterBar({
  filters,
  onFiltersChange,
}: FilterBarProps) {
  // The input text, expecting a pattern "field: value"
  const [input, setInput] = React.useState("");

  // Validate the field by checking if it exists in filterEnumMap keys
  const isValidField = (field: string): boolean => {
    return Object.keys(filterEnumMap).includes(field);
  };

  // When the user presses Enter, try to parse and add a token if valid.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Split the input into field and value
      const [fieldPart, ...valueParts] = input.split(":");
      const field = fieldPart.trim().toLowerCase();
      const value = valueParts.join(":").trim();

      if (!field || !value) return;

      if (!isValidField(field)) {
        // Optionally show an error or ignore invalid fields
        console.warn(`Invalid filter field: ${field}`);
        return;
      }

      // Optionally, validate that the value is one of the allowed options for this field.
      const allowedValues = filterEnumMap[
        field as keyof typeof filterEnumMap
      ] as string[];
      if (allowedValues && !allowedValues.includes(value.toUpperCase())) {
        console.warn(`Invalid filter value for ${field}: ${value}`);
        // You could choose to allow any value or force selection from allowed values.
      }

      // Create a new token and add it to the list if it doesn't already exist.
      const newToken: FilterToken = { field, value: value.toUpperCase() };
      const tokenExists = filters.some(
        (token) =>
          token.field === newToken.field && token.value === newToken.value,
      );
      if (!tokenExists) {
        onFiltersChange([...filters, newToken]);
      }

      setInput("");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Input Field for Adding a New Filter */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Type filter as "field: value" (e.g., overallStatus: Recruiting)'
        className="border border-gray-300 rounded px-2 py-1 w-full"
      />
      {/* Display Active Filter Tokens */}
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
              onClick={() =>
                onFiltersChange(filters.filter((_, i) => i !== index))
              }
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
          onClick={clearFilters}
          className="text-sm text-blue-600 underline self-start"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
