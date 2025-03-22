"use client";

import { useCallback, useMemo } from "react";
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
const DEFAULT_LIMIT = "10";

export default function LimitDropdown({
  onLimitsChange,
  queryString,
}: LimitDropdownProps) {
  const query = useMemo(
    () => qs.parse(queryString, { ignoreQueryPrefix: true }),
    [queryString],
  );
  const selected = (query.limit as string) || DEFAULT_LIMIT;

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
