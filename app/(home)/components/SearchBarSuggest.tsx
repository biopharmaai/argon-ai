"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchSuggest } from "@/app/(home)/hooks/useSearchSuggest";
import SuggestionDropdown from "./SuggestionDropdown";

export default function SearchBarSuggest() {
  const {
    term,
    setTerm,
    suggestions,
    highlightedIndex,
    placeholder,
    handleKeyDown,
    handleSubmit,
  } = useSearchSuggest();

  return (
    <div
      className={cn(
        "w-full max-w-3xl rounded-lg border bg-white shadow-sm transition-all",
        suggestions.length > 0
          ? "rounded-b-none border-[#1B4DED] ring-1 ring-[#1B4DED]"
          : "border-muted",
        "focus-within:ring-2 focus-within:ring-[#1B4DED]",
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value =
            highlightedIndex >= 0 ? suggestions[highlightedIndex] : term;
          handleSubmit(value);
        }}
        className="flex w-full items-center px-4 py-6 sm:py-4"
      >
        <div className="relative w-full">
          <Input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pr-10"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
            onClick={() => handleSubmit(term)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
      <SuggestionDropdown
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        visible={suggestions.length > 0}
        onSelect={(value) => handleSubmit(value)}
      />
    </div>
  );
}
