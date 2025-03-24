"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  suggestions: string[];
  highlightedIndex: number;
  visible: boolean;
  onSelect: (value: string) => void;
}

export default function SuggestionDropdown({
  suggestions,
  highlightedIndex,
  visible,
  onSelect,
}: Props) {
  return (
    <div
      className={cn(
        "w-full rounded-b-lg border-t border-[#1B4DED] bg-white px-4 py-2 text-left text-base transition-all",
        visible ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      {suggestions.map((suggestion, i) => (
        <div
          key={i}
          onClick={() => onSelect(suggestion)}
          className={cn(
            "cursor-pointer py-2 hover:bg-gray-100",
            i === highlightedIndex && "bg-gray-100",
          )}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}
