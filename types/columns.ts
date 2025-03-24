import { JSX } from "react";
import type { ClinicalTrial } from "./clinicalTrials";

export type ColumnSelectorConfig = {
  id: string;
  label: string;
  enabled: boolean;
};

export type ColumnConfig = {
  id: string;
  label: string;
  accessor: (row: ClinicalTrial) => string | undefined;
  cell?: (val: string) => JSX.Element | string;
  enabled: boolean;
  meta?: {
    className: "max-w-[400px] truncate whitespace-nowrap overflow-hidden";
  };
};
