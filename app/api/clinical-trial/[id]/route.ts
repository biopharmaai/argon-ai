import { NextRequest, NextResponse } from "next/server";
import _data from "@/data/ctg-studies.json"; // adjust path if needed
import { ClinicalTrial } from "@/types/clinicalTrials";

const data = _data as ClinicalTrial[];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = data.find(
    (trial) =>
      trial.protocolSection.identificationModule.nctId.toLowerCase() ===
      id.toLowerCase(),
  );

  if (!match) {
    return NextResponse.json(
      { error: `Clinical trial with NCT ID "${id}" not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json({ trial: match });
}
