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

    // const updatedQuery = { ...baseQueryObject };
    // updatedQuery.filter = {};
    // updatedFilters.forEach((token) => {
    //   updatedQuery.filter[token.field] = token.value;
    // });

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
    <div className="w-full space-y-4 rounded-md border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={selectedField}
          onValueChange={(val) => {
            setSelectedField(val);
            setSelectedValue("");
          }}
        >
          <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-48">
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

        {selectedField && selectedValue && (
          <Button onClick={addFilter} className="h-10">
            Add Filter
          </Button>
        )}
      </div>

      {filterTokens.length > 0 && (
        <div className="space-y-2">
          {filterTokens.map((token) => (
            <div
              key={token.field}
              className="flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex-1 font-medium select-none">
                {token.field}: {token.value}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(token.field)}
              >
                <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            </div>
          ))}
          <Button
            variant="link"
            size="sm"
            onClick={clearAll}
            className="text-sm text-blue-600"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
