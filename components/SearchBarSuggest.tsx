"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "@/ctg-studies.json";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const data = _data as ClinicalTrial[];

export default function SearchBarSuggest() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    const filtered = allKeywords
      .filter((kw) => kw.toLowerCase().includes(lower))
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
    <div className="relative w-full">
      <div
        className={`overflow-hidden border border-[#1B4DED] bg-white shadow-sm transition-all ${
          suggestions.length > 0 && isFocused
            ? "rounded-t-lg rounded-b-none"
            : "rounded-lg"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value =
              highlightedIndex >= 0 ? suggestions[highlightedIndex] : term;
            handleSubmit(value);
          }}
          className={`relative w-full rounded-lg border ${isFocused || suggestions.length > 0 ? "border-[#1B4DED]" : "border-gray-300"} bg-white shadow-sm transition-colors`}
        >
          <div className="flex items-center px-4 py-4 sm:py-6">
            <Input
              type="text"
              name="q"
              placeholder={placeholder}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full border-none font-mono text-lg tracking-tight focus:ring-0 focus:outline-none"
            />
            <Button
              type="submit"
              className="ml-2 h-9 w-9 shrink-0 rounded-md bg-white hover:bg-gray-100"
              variant="ghost"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 z-10 mt-0 w-full rounded-b-lg border-t border-gray-200 bg-white shadow">
              {suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  onMouseDown={() => handleSubmit(suggestion)} // prevent blur before click
                  className={`cursor-pointer px-4 py-2 text-center text-sm hover:bg-gray-100 ${
                    i === highlightedIndex ? "bg-gray-100" : ""
                  }`}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* {suggestions.length > 0 && isFocused && (
        <div className="absolute z-10 w-full rounded-b-lg border border-t-0 border-[#1B4DED] bg-white shadow-sm">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              onClick={() => handleSubmit(suggestion)}
              className={`cursor-pointer px-4 py-2 text-center text-base hover:bg-gray-100 ${
                i === highlightedIndex ? "bg-gray-100" : ""
              }`}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )} */}
      {suggestions.length > 0 && (
        <div
          ref={resultsRef}
          className="z-0 -mt-px w-full rounded-b-lg border border-t-0 border-[#1B4DED] bg-white py-2 shadow-md"
        >
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              onClick={() => handleSubmit(suggestion)}
              className={`cursor-pointer px-4 py-2 text-center text-sm hover:bg-gray-100 ${
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
