"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchBarProps {
  onChange: (term: string) => void;
  value?: string;
}

export default function SearchBar({ onChange, value = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  const debouncedChange = useMemo(() => debounce(onChange, 500), [onChange]);

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

  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor="search-input" className="sr-only">
        Search studies
      </Label>
      <div className="relative">
        <SearchIcon
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search studies..."
          className="pl-9"
          aria-label="Search studies"
        />
      </div>
    </div>
  );
}
