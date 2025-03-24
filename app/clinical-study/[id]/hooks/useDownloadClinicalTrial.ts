"use client";

import { useCallback } from "react";
import { ClinicalTrial } from "@/types/clinicalTrials";

export function useDownloadClinicalTrial(
  trial: ClinicalTrial | null,
  format: "csv" | "json",
  onClose?: () => void,
) {
  return useCallback(() => {
    if (!trial) return;

    let data: string;
    let fileType: string;
    let fileName: string;

    if (format === "json") {
      data = JSON.stringify(trial, null, 2);
      fileType = "application/json";
      fileName = "clinical_trial.json";
    } else {
      data = `NCT ID,Brief Title,Official Title,Sponsor,Overall Status,Start Date,Completion Date\n`;
      data += `"${trial.protocolSection.identificationModule.nctId}","${trial.protocolSection.identificationModule.briefTitle}","${trial.protocolSection.identificationModule.officialTitle || ""}","${trial.protocolSection.identificationModule.organization.fullName}","${trial.protocolSection.statusModule.overallStatus}","${trial.protocolSection.statusModule.startDateStruct?.date || ""}","${trial.protocolSection.statusModule.completionDateStruct?.date || ""}"\n`;
      fileType = "text/csv";
      fileName = "clinical_trial.csv";
    }

    const blob = new Blob([data], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onClose) onClose();
  }, [trial, format, onClose]);
}
