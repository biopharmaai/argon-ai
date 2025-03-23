"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import qs from "qs";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const placeholders = [
  "AUTOMATE COMPETITIVE INTELLIGENCE...",
  "WHAT ABSTRACTS ARE BEING PUBLISHED...",
  "HOW ARE COMPANIES POSITIONING THEIR DRUGS...",
  "WHAT DO DOCTORS CONSIDER WHEN PRESCRIBING...",
];

export default function SearchBarSuggest() {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing animation
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

  // Fetch suggestions from backend
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/keywords?term=${encodeURIComponent(input)}`,
      );
      const json = await res.json();
      setSuggestions(json.suggestions || []);
      setHighlightedIndex(-1);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  }, []);

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300),
    [fetchSuggestions],
  );

  useEffect(() => {
    debouncedFetchSuggestions(term);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [term, debouncedFetchSuggestions]);

  const handleSubmit = (value: string) => {
    if (!value) return;
    const defaultFields = [
      "nctId",
      "briefTitle",
      "organization",
      "status",
      "conditions",
      "startDate",
      "completionDate",
    ];
    const query = qs.stringify({
      term: value,
      fields: defaultFields.join(","),
    });
    router.push(`/search?${query}`);
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
