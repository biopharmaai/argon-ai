"use client";

import * as React from "react";
// Remove any extra ChevronDown import if you don't need a custom icon
// import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitDropdownProps {
  value: number;
  onChange: (limit: number) => void;
}

const options = [10, 25, 50, 100];

export default function LimitDropdown({ value, onChange }: LimitDropdownProps) {
  // We'll store the selected value as a string because the Select component works with strings.
  const [selected, setSelected] = React.useState<string>(value.toString());

  const selectOption = React.useCallback(
    (option: string) => {
      setSelected(option);
      onChange(Number(option));
    },
    [setSelected, onChange],
  );

  // When the selection changes, notify the parent.
  React.useEffect(() => {
    onChange(Number(selected));
  }, [selected, onChange]);

  return (
    <div className="flex space-x-2 items-center">
      <Select value={selected} onValueChange={selectOption}>
        <SelectTrigger>
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
        {/* The SelectContent is given a solid white background */}
        <SelectContent className="bg-white">
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>studies per page</span>
    </div>
  );
}
