"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchSuggest } from "@/app/(home)/hooks/useSearchSuggest";

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
      {suggestions.length > 0 && (
        <div className="w-full rounded-b-lg border-t border-[#1B4DED] bg-white px-4 py-2 text-left text-base">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              onClick={() => handleSubmit(suggestion)}
              className={`cursor-pointer py-2 hover:bg-gray-100 ${
                i === highlightedIndex ? "bg-gray-100" : ""
              }`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
