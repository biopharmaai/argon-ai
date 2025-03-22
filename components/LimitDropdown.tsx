"use client";

import { useCallback } from "react";
import qs from "qs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitDropdownProps {
  queryString: string;
  onLimitsChange: (limit: number) => void;
}

const options = [10, 25, 50, 100];

export default function LimitDropdown({
  queryString,
  onLimitsChange,
}: LimitDropdownProps) {
  const query = qs.parse(queryString, { ignoreQueryPrefix: true });
  const selected = (query.limit as string) || "10";

  const selectOption = useCallback(
    (option: string) => {
      onLimitsChange(Number(option));
    },
    [onLimitsChange],
  );

  return (
    <div className="flex items-center space-x-2">
      <Select value={selected} onValueChange={selectOption}>
        <SelectTrigger>
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
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
