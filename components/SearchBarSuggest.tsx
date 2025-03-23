"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "@/ctg-studies.json";
import { cn } from "@/lib/utils";

const data = _data as ClinicalTrial[];

export default function SearchBarSuggest() {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const placeholders = [
    "AUTOMATE COMPETITIVE INTELLIGENCE...",
    "WHAT ABSTRACTS ARE BEING PUBLISHED...",
    "HOW ARE COMPANIES POSITIONING THEIR DRUGS...",
    "WHAT DO DOCTORS CONSIDER WHEN PRESCRIBING...",
  ];
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = placeholders[phraseIndex];
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setCharIndex((prev) => prev - 1);
        } else {
          setCharIndex((prev) => prev + 1);
        }

        if (!isDeleting && charIndex === current.length) {
          setIsDeleting(true);
        } else if (isDeleting && charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % placeholders.length);
        }

        setPlaceholder(current.substring(0, charIndex));
      },
      isDeleting ? 40 : 100,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  const allKeywords = Array.from(
    new Set(
      data.flatMap((trial) => [
        ...(trial.protocolSection.conditionsModule?.conditions ?? []),
        ...(trial.protocolSection.conditionsModule?.keywords ?? []),
      ]),
    ),
  );

  useEffect(() => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    const lower = term.toLowerCase();
    // const filtered = allKeywords
    //   .filter((kw) => kw.toLowerCase().includes(lower))
    //   .slice(0, 8);
    const filtered = allKeywords
      .filter((kw) => kw.toLowerCase().includes(lower))
      .sort((a, b) => a.localeCompare(b)) // Alphabetical sorting
      .slice(0, 8);

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
        <Input
          type="text"
          name="q"
          placeholder={placeholder}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-none px-2 font-mono text-lg tracking-tight focus:ring-0 focus:outline-none"
        />
        <Button
          type="submit"
          className="ml-2 h-9 w-9 rounded-md bg-white hover:bg-gray-100"
          variant="ghost"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div
          ref={resultsRef}
          className="w-full rounded-b-lg border-t border-[#1B4DED] bg-white px-4 py-2 text-left text-base"
        >
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
