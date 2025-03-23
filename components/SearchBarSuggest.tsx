"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "@/ctg-studies.json";

const data = _data as ClinicalTrial[];

export default function SearchBarSuggest() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allKeywords = Array.from(
    new Set(
      data.flatMap((trial) => {
        return [
          ...(trial.protocolSection.conditionsModule?.conditions ?? []),
          ...(trial.protocolSection.conditionsModule?.keywords ?? []),
        ];
      }),
    ),
  );

  useEffect(() => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    const lower = term.toLowerCase();
    const filtered = allKeywords
      .filter((kw) => kw.toLowerCase().includes(lower))
      .slice(0, 8); // Limit suggestions
    setSuggestions(filtered);
    setHighlightedIndex(-1);
  }, [term]);

  const handleSubmit = (value: string) => {
    if (!value) return;
    router.push(`/search?term=${encodeURIComponent(value)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected =
        highlightedIndex >= 0 ? suggestions[highlightedIndex] : term;
      handleSubmit(selected);
    }
  };

  return (
    <div className="relative max-w-xl">
      <Input
        type="text"
        placeholder="Search studies..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full"
      />
      {suggestions.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow"
        >
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              onClick={() => handleSubmit(suggestion)}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${
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
