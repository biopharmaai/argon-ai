"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

interface LimitDropdownProps {
  value: number;
  onChange: (limit: number) => void;
}

const options = [10, 25, 50, 100];

export default function LimitDropdown({ value, onChange }: LimitDropdownProps) {
  const [selected, setSelected] = useState<number>(value);
  const [isOpen, setIsOpen] = useState(false); // Manually manage open state for icon change

  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  return (
    <div className="w-40">
      <Listbox
        value={selected}
        onChange={(newSelected) => {
          setSelected(newSelected);
          setIsOpen(false); // Close dropdown after selection
        }}
      >
        {({ open }) => (
          <div className="relative mt-1">
            <ListboxButton
              className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring focus:border-blue-300 sm:text-sm"
              onClick={() => setIsOpen(!isOpen)} // Toggle open state manually
            >
              <span className="block truncate">{selected}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </span>
            </ListboxButton>
            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <ListboxOption
                    key={option}
                    value={option}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected: isSelected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            isSelected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option}
                        </span>
                        {isSelected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
