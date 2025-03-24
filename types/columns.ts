import { JSX } from "react";
import type { ClinicalTrial } from "./clinicalTrials";

export type ColumnConfig = {
  id: string;
  label: string;
  accessor: (row: ClinicalTrial) => string | undefined;
  cell?: (val: string) => JSX.Element | string;
  enabled: boolean;
};
