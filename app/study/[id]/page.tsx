"use client";

import { notFound, useParams } from "next/navigation";
import { useClinicalTrial } from "./hooks/useClinicalTrial";
import { Skeleton } from "@/components/ui/skeleton";
import ClinicalTrialDetails from "./components/ClinicalTrialDetails";

export default function ClinicalTrialPage() {
  const params = useParams<{ id: string }>();
  const { trial, loading, open, setOpen, format, setFormat, handleDownload } =
    useClinicalTrial(params.id);

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
