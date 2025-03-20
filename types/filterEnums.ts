// Enums

export enum OverallStatus {
  NotYetRecruiting = "NOT_YET_RECRUITING",
  Recruiting = "RECRUITING",
  EnrollingByInvitation = "ENROLLING_BY_INVITATION",
  ActiveNotRecruiting = "ACTIVE_NOT_RECRUITING",
  Completed = "COMPLETED",
  Suspended = "SUSPENDED",
  Terminated = "TERMINATED",
  Withdrawn = "WITHDRAWN",
  UnknownStatus = "UNKNOWN_STATUS",
}

export enum StudyType {
  Observational = "OBSERVATIONAL",
  Interventional = "INTERVENTIONAL",
}

export enum Masking {
  None = "NONE",
  Single = "SINGLE",
  Double = "DOUBLE",
  Triple = "TRIPLE",
  Quadruple = "QUADRUPLE",
}

export enum ResponsiblePartyType {
  SponsorInvestigator = "SPONSOR_INVESTIGATOR",
  PrincipalInvestigator = "PRINCIPAL_INVESTIGATOR",
  Sponsor = "SPONSOR",
}

export enum OrganizationClass {
  Other = "OTHER",
  Industry = "INDUSTRY",
  NIH = "NIH",
  Unknown = "UNKNOWN",
}

export enum Allocation {
  Randomized = "RANDOMIZED",
  NonRandomized = "NON_RANDOMIZED",
}

export enum InterventionModel {
  Parallel = "PARALLEL",
  Crossover = "CROSSOVER",
  Factorial = "FACTORIAL",
  SingleGroupAssignment = "SINGLE_GROUP_ASSIGNMENT",
}

export enum PrimaryPurpose {
  Treatment = "TREATMENT",
  Prevention = "PREVENTION",
  Diagnostic = "DIAGNOSTIC",
  SupportiveCare = "SUPPORTIVE_CARE",
  Screening = "SCREENING",
  HealthServicesResearch = "HEALTH_SERVICES_RESEARCH",
  BasicScience = "BASIC_SCIENCE",
  DeviceFeasibility = "DEVICE_FEASIBILITY",
}

export enum StudyPhase {
  NA = "NA",
  Phase1 = "PHASE1",
  Phase1_2 = "PHASE1/2",
  Phase2 = "PHASE2",
  Phase2_3 = "PHASE2/3",
  Phase3 = "PHASE3",
  Phase4 = "PHASE4",
}

export enum InterventionType {
  Device = "DEVICE",
  Drug = "DRUG",
  Biological = "BIOLOGICAL",
  Behavioral = "BEHAVIORAL",
}

export enum IPDSharing {
  Yes = "YES",
  No = "NO",
}

export enum StandardAge {
  Child = "CHILD",
  Adult = "ADULT",
  OlderAdult = "OLDER_ADULT",
}

export enum Sex {
  All = "ALL",
  Male = "MALE",
  Female = "FEMALE",
}

export enum SamplingMethod {
  NonProbabilitySample = "NON_PROBABILITY_SAMPLE",
  ProbabilitySample = "PROBABILITY_SAMPLE",
}

export enum DateType {
  Actual = "ACTUAL",
  Estimated = "ESTIMATED",
}
