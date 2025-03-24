import { NextResponse } from "next/server";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "@/data/ctg-studies.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get("term") || "").toLowerCase();

  const data = _data as ClinicalTrial[];

  const keywordMap = new Map<string, string>();

  data.forEach((trial) => {
    const conditions = trial.protocolSection.conditionsModule;
    [
      ...(conditions?.conditions || []),
      ...(conditions?.keywords || []),
    ].forEach((kw) => {
      const key = kw.toLowerCase();
      if (!keywordMap.has(key)) {
        keywordMap.set(key, kw); // store first casing
      }
    });
  });

  const results = Array.from(keywordMap.entries())
    .filter(([key]) => key.includes(term))
    .map(([, original]) => original)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);

  return NextResponse.json({ suggestions: results });
}
