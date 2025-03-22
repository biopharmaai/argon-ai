"use client";

import { notFound, useParams } from "next/navigation";
import { ClinicalTrial } from "@/types/clinicalTrials";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";

async function getClinicalTrial(nctId: string): Promise<ClinicalTrial | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/study/${nctId}`,
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json.trial as ClinicalTrial;
}

export default function ClinicalTrialPage() {
  const params = useParams<{ nctId: string }>();
  console.log("params", params);

  const [trial, setTrial] = useState<ClinicalTrial | null>(null);
  useEffect(() => {
    getClinicalTrial(params.nctId).then((data) => {
      console.log("getting data", data);
      setTrial(data);
    });
  }, [params.nctId]);
  // const trial = await getClinicalTrial(params.nctId);
  if (!trial) return notFound();

  const idMod = trial.protocolSection.identificationModule;
  const statusMod = trial.protocolSection.statusModule;
  const description = trial.protocolSection.descriptionModule.briefSummary;
  const design = trial.protocolSection.designModule;
  const eligibility = trial.protocolSection.eligibilityModule;
  const locations = trial.protocolSection.contactsLocationsModule.locations;
  const outcomes = trial.protocolSection.outcomesModule.primaryOutcomes;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{idMod.briefTitle}</CardTitle>
          <p className="text-muted-foreground text-sm">NCT ID: {idMod.nctId}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Sponsor: {idMod.organization.fullName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{statusMod.overallStatus}</p>
          <p className="text-muted-foreground text-sm">
            Start Date: {statusMod.startDateStruct?.date}
          </p>
          <p className="text-muted-foreground text-sm">
            Completion Date: {statusMod.completionDateStruct?.date || "—"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brief Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Type: {design.studyType}</p>
          <p className="text-sm">
            Enrollment: {design.enrollmentInfo.count} (
            {design.enrollmentInfo.type})
          </p>
          {design.phases && (
            <p className="text-sm">Phases: {design.phases.join(", ")}</p>
          )}
          {design.designInfo?.primaryPurpose && (
            <p className="text-sm">
              Primary Purpose: {design.designInfo.primaryPurpose}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Sex: {eligibility.sex}</p>
          <p className="text-sm">
            Ages: {eligibility.minimumAge} – {eligibility.maximumAge || "N/A"}
          </p>
          <p className="mt-2 text-sm whitespace-pre-line">
            {eligibility.eligibilityCriteria}
          </p>
        </CardContent>
      </Card>

      {locations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {locations.map((loc, i) => (
                <li key={i}>
                  {loc.facility} – {loc.city}, {loc.state}, {loc.country}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {outcomes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {outcomes.map((out, i) => (
                <li key={i}>
                  <p className="font-medium">{out.measure}</p>
                  {out.timeFrame && (
                    <p className="text-muted-foreground">
                      Time Frame: {out.timeFrame}
                    </p>
                  )}
                  {out.description && <p>{out.description}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
