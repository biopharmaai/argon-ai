"use client";

import qs from "qs";
import { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import { Search as SearchIcon, X as ClearIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchBarProps {
  className?: string;
  queryString: string;
  onSearchChange: (term: string) => void;
}

export default function SearchBar({
  className,
  queryString,
  onSearchChange,
}: SearchBarProps) {
  const baseQueryObject = useMemo(
    () => qs.parse(queryString, { ignoreQueryPrefix: true }),
    [queryString],
  );
  const value = (baseQueryObject.term as string) || "";

  const [searchTerm, setSearchTerm] = useState(value);

  const debouncedChange = useMemo(
    () => debounce(onSearchChange, 300),
    [onSearchChange],
  );

  useEffect(() => {
    return () => {
      debouncedChange.cancel();
    };
  }, [debouncedChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchTerm(val);
      debouncedChange(val);
    },
    [debouncedChange],
  );

  const handleClear = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <Label htmlFor="search-input" className="sr-only">
        Search studies
      </Label>
      <div className="relative">
        {/* Search Icon */}
        <SearchIcon
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />

        {/* Clear (X) Button */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            aria-label="Clear search"
          >
            <ClearIcon className="h-4 w-4" />
          </button>
        )}

        <Input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search studies..."
          className="pr-9 pl-9"
          aria-label="Search studies"
        />
      </div>
    </div>
  );
}
