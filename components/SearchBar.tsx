"use client";

import { useState, useEffect, useMemo } from "react";
import { Transition } from "@headlessui/react";
import { Search as SearchIcon } from "lucide-react";
import { debounce } from "lodash";

interface SearchBarProps {
  onChange: (term: string) => void;
  value?: string;
}

export default function SearchBar({ onChange, value = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  // Create a debounced function using useMemo
  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((newTerm: string) => {
        onChange(newTerm);
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      // console.error("cleaning up");
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // Update the debounced state on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSetSearchTerm(e.target.value);
  };

  return (
    <Transition
      appear={true}
      show={true}
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Transition>
  );
}
