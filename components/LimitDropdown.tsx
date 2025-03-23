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
import { Label } from "@/components/ui/label";

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
    <div className="text-muted-foreground flex items-center space-x-2 text-sm">
      <Label htmlFor="limit-select" className="font-medium whitespace-nowrap">
        Studies per page
      </Label>
      <Select value={selected} onValueChange={selectOption}>
        <SelectTrigger
          id="limit-select"
          aria-label="Results per page"
          className="h-9 w-[100px] text-sm"
        >
          <SelectValue placeholder="Select limit" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option}
              value={option.toString()}
              aria-label={`Show ${option} results per page`}
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
