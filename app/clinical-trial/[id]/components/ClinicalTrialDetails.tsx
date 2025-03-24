"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ClinicalTrial } from "@/types/clinicalTrials";

interface Props {
  trial: ClinicalTrial;
  onDownloadClick: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  format: "csv" | "json";
  setFormat: (format: "csv" | "json") => void;
}

export default function ClinicalTrialDetails({
  trial,
  onDownloadClick,
  open,
  setOpen,
  format,
  setFormat,
}: Props) {
  const {
    identificationModule: idMod,
    statusModule: statusMod,
    descriptionModule: descMod,
    designModule: design,
    eligibilityModule: eligibility,
    contactsLocationsModule,
    outcomesModule,
  } = trial.protocolSection;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Export Clinical Trial
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Clinical Trial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={format}
              onValueChange={(val: "csv" | "json") => setFormat(val)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button onClick={onDownloadClick}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>{idMod.briefTitle}</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sponsor: {idMod.organization.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="font-medium">NCT ID:</span> {idMod.nctId}
          </p>
          {idMod.officialTitle && (
            <p>
              <span className="font-medium">Official Title:</span>{" "}
              {idMod.officialTitle}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          <p>
            <span className="font-medium">Overall Status:</span>{" "}
            {statusMod.overallStatus}
          </p>
          <p>
            <span className="font-medium">Start Date:</span>{" "}
            {statusMod.startDateStruct?.date || "—"}
          </p>
          <p>
            <span className="font-medium">Completion Date:</span>{" "}
            {statusMod.completionDateStruct?.date || "—"}
          </p>
        </CardContent>
      </Card>

      {descMod.briefSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Brief Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-line">
            {descMod.briefSummary}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Study Type:</span> {design.studyType}
          </p>
          <p>
            <span className="font-medium">Enrollment:</span>{" "}
            {design.enrollmentInfo.count} ({design.enrollmentInfo.type})
          </p>
          {design.phases && design.phases.length > 0 && (
            <p>
              <span className="font-medium">Phases:</span>{" "}
              {design.phases.join(", ")}
            </p>
          )}
          {design.designInfo?.primaryPurpose && (
            <p>
              <span className="font-medium">Primary Purpose:</span>{" "}
              {design.designInfo.primaryPurpose}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Sex:</span> {eligibility.sex}
          </p>
          <p>
            <span className="font-medium">Ages:</span> {eligibility.minimumAge}{" "}
            – {eligibility.maximumAge || "N/A"}
          </p>
          {eligibility.eligibilityCriteria && (
            <div className="mt-2 whitespace-pre-line">
              <span className="font-medium">Criteria:</span>{" "}
              {eligibility.eligibilityCriteria}
            </div>
          )}
        </CardContent>
      </Card>

      {contactsLocationsModule?.locations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {contactsLocationsModule.locations.map((loc, i) => (
                <li key={i}>
                  {loc.facility} – {loc.city}, {loc.state}, {loc.country}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {outcomesModule.primaryOutcomes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {outcomesModule.primaryOutcomes.map((out, i) => (
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
