"use client";

import { useState, useEffect } from "react";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { useDownloadClinicalTrial } from "./useDownloadClinicalTrial";

export function useClinicalTrial(nctId: string | undefined) {
  const [trial, setTrial] = useState<ClinicalTrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");

  const handleDownload = useDownloadClinicalTrial(trial, format, () =>
    setOpen(false),
  );

  useEffect(() => {
    if (!nctId) return;
    const getClinicalTrial = async () => {
      try {
        const res = await fetch(`/api/study/${nctId}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setTrial(json.trial);
      } catch (err) {
        console.error("Error fetching clinical trial:", err);
      } finally {
        setLoading(false);
      }
    };
    getClinicalTrial();
  }, [nctId]);

  return {
    trial,
    loading,
    open,
    setOpen,
    format,
    setFormat,
    handleDownload,
  };
}
