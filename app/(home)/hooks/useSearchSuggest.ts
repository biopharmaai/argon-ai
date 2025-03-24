"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import qs from "qs";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { defaultFields } from "@/lib/constants";
import { DEFAULT_DEBOUNCE_TIME } from "@/lib/constants";

const placeholders = [
  "AUTOMATE COMPETITIVE INTELLIGENCE...",
  "WHAT ABSTRACTS ARE BEING PUBLISHED...",
  "HOW ARE COMPANIES POSITIONING THEIR DRUGS...",
  "WHAT DO DOCTORS CONSIDER WHEN PRESCRIBING...",
];

export function useSearchSuggest() {
  const router = useRouter();
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
    () => debounce(fetchSuggestions, DEFAULT_DEBOUNCE_TIME),
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

  return {
    term,
    setTerm,
    suggestions,
    highlightedIndex,
    setHighlightedIndex,
    placeholder,
    handleKeyDown,
    handleSubmit,
  };
}
