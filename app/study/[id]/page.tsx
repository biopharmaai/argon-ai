"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { Skeleton } from "@/components/ui/skeleton";
import ClinicalTrialDetails from "./components/ClinicalTrialDetails";

async function getClinicalTrial(nctId: string): Promise<ClinicalTrial | null> {
  const res = await fetch(`/api/study/${nctId}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.trial as ClinicalTrial;
}

export default function ClinicalTrialPage() {
  const params = useParams<{ id: string }>();
  const [trial, setTrial] = useState<ClinicalTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");

  useEffect(() => {
    if (!params.id) return;
    getClinicalTrial(params.id)
      .then((data) => {
        setTrial(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching clinical trial:", err);
        setLoading(false);
      });
  }, [params.id]);

  const handleDownload = () => {
    if (!trial) return;
    let data;
    let fileType;
    let fileName;
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
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!trial) return notFound();

  return (
    <ClinicalTrialDetails
      trial={trial}
      onDownloadClick={handleDownload}
      open={open}
      setOpen={setOpen}
      format={format}
      setFormat={setFormat}
    />
  );
}
