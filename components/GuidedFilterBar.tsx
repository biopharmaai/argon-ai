"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import qs from "qs";
import { filterEnumMap } from "@/types/filterEnums";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterToken {
  field: string;
  value: string;
}

interface GuidedFilterBarProps {
  onFiltersCommitted: (filters: FilterToken[]) => void;
  queryString: string;
}

export default function GuidedFilterBar({
  onFiltersCommitted,
  queryString,
}: GuidedFilterBarProps) {
  const [selectedField, setSelectedField] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const baseQueryObject = useMemo(
    () => qs.parse(queryString, { ignoreQueryPrefix: true }),
    [queryString],
  );

  const filterTokens: FilterToken[] = useMemo(() => {
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

  const fields = useMemo(() => {
    const usedFields = new Set(filterTokens.map((t) => t.field));
    return Object.keys(filterEnumMap)
      .filter((field) => !usedFields.has(field))
      .sort((a, b) => a.localeCompare(b));
  }, [filterTokens]);

  const addFilter = () => {
    if (!selectedField || !selectedValue) return;

    const newToken: FilterToken = {
      field: selectedField,
      value: selectedValue,
    };
    const updatedFilters = filterTokens.filter(
      (f) => f.field !== selectedField,
    );
    updatedFilters.push(newToken);

    const updatedQuery = { ...baseQueryObject };
    updatedQuery.filter = {};
    updatedFilters.forEach((token) => {
      updatedQuery.filter[token.field] = token.value;
    });

    onFiltersCommitted(updatedFilters);
    setSelectedField("");
    setSelectedValue("");
  };

  const removeFilter = (field: string) => {
    const updatedFilters = filterTokens.filter((f) => f.field !== field);
    onFiltersCommitted(updatedFilters);
  };

  const clearAll = () => {
    onFiltersCommitted([]);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Add filter section */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={selectedField}
          onValueChange={(val) => {
            setSelectedField(val);
            setSelectedValue("");
          }}
        >
          <SelectTrigger className="w-48" aria-label="Select filter field">
            <SelectValue placeholder="Select field..." />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedField && (
          <Select
            value={selectedValue}
            onValueChange={(val) => setSelectedValue(val)}
          >
            <SelectTrigger className="w-48" aria-label="Select filter value">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {(
                filterEnumMap[
                  selectedField as keyof typeof filterEnumMap
                ] as string[]
              ).map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          onClick={addFilter}
          disabled={!selectedField || !selectedValue}
          aria-label="Add filter"
        >
          Add Filter
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterTokens.map((token) => (
          <div
            key={token.field}
            className="bg-muted flex items-center rounded px-3 py-1 text-sm"
          >
            {token.field}: {token.value}
            <button
              onClick={() => removeFilter(token.field)}
              className="ml-2"
              aria-label={`Remove filter for ${token.field}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Clear all */}
      {filterTokens.length > 0 && (
        <Button
          variant="link"
          size="sm"
          onClick={clearAll}
          className="self-start p-0 text-blue-600"
          aria-label="Clear all filters"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
