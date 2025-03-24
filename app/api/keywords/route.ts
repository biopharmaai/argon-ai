import { NextResponse } from "next/server";
import { ClinicalTrial } from "@/types/clinicalTrials";
import _data from "@/data/ctg-studies.json";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get("term") || "").toLowerCase();

  const data = _data as ClinicalTrial[];

  const keywords = new Set<string>();
  data.forEach((trial) => {
    trial.protocolSection.conditionsModule?.conditions?.forEach((kw) =>
      keywords.add(kw),
    );
    trial.protocolSection.conditionsModule?.keywords?.forEach((kw) =>
      keywords.add(kw),
    );
  });

  const results = Array.from(keywords)
    .filter((kw) => kw.toLowerCase().includes(term))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);

  return NextResponse.json({ suggestions: results });
}
