// types/clinicalTrials.ts
import {
  OverallStatus,
  StudyType,
  Masking,
  ResponsiblePartyType,
  OrganizationClass,
  Allocation,
  InterventionModel,
  PrimaryPurpose,
  StudyPhase,
  InterventionType,
  IPDSharing,
  StandardAge,
  Sex,
  SamplingMethod,
  DateType,
} from "./filterEnums";

interface ProtocolSection {
  identificationModule: IdentificationModule;
  statusModule: StatusModule;
  sponsorCollaboratorsModule: SponsorCollaboratorsModule;
  oversightModule: OversightModule;
  descriptionModule: DescriptionModule;
  conditionsModule: ConditionsModule;
  designModule: DesignModule;
  armsInterventionsModule: ArmsInterventionsModule;
  outcomesModule: OutcomesModule;
  eligibilityModule: EligibilityModule;
  contactsLocationsModule: ContactsLocationsModule;
  referencesModule: ReferencesModule;
  ipdSharingStatementModule?: IPDSharingStatementModule;
}

interface IdentificationModule {
  nctId: string;
  orgStudyIdInfo: { id: string };
  secondaryIdInfos?: Array<{
    id: string;
    type: string;
    link?: string;
    domain?: string;
  }>;
  organization: { fullName: string; class: OrganizationClass };
  briefTitle: string;
  officialTitle: string;
}

interface StatusModule {
  statusVerifiedDate: string;
  overallStatus: OverallStatus;
  expandedAccessInfo: { hasExpandedAccess: boolean };
  startDateStruct: { date: string; type: DateType };
  primaryCompletionDateStruct: { date: string; type: DateType };
  completionDateStruct?: { date: string; type: DateType };
  studyFirstSubmitDate: string;
  studyFirstSubmitQcDate: string;
  studyFirstPostDateStruct: { date: string; type: DateType };
  lastUpdateSubmitDate: string;
  lastUpdatePostDateStruct: { date: string; type: DateType };
}

interface SponsorCollaboratorsModule {
  responsibleParty: {
    type: ResponsiblePartyType;
    investigatorFullName?: string;
    investigatorTitle?: string;
    investigatorAffiliation?: string;
  };
  leadSponsor: { name: string; class: OrganizationClass };
  collaborators?: Array<{ name: string; class: string }>;
}

interface OversightModule {
  oversightHasDmc?: boolean;
  isFdaRegulatedDrug?: boolean;
  isFdaRegulatedDevice?: boolean;
  isUsExport?: boolean;
}

interface DescriptionModule {
  briefSummary: string;
}

interface ConditionsModule {
  conditions?: string[];
  keywords?: string[];
}

interface DesignModule {
  studyType: StudyType;
  patientRegistry?: boolean;
  phases?: StudyPhase[];
  designInfo: {
    observationalModel?: string;
    timePerspective?: string;
    allocation?: Allocation;
    interventionModel?: InterventionModel;
    primaryPurpose?: PrimaryPurpose;
    maskingInfo?: {
      masking: Masking;
      maskingDescription?: string;
      whoMasked?: string[];
    };
  };
  enrollmentInfo: { count: number; type: string };
}

interface ArmsInterventionsModule {
  armGroups: ArmGroup[];
  interventions: Intervention[];
}

interface ArmGroup {
  label: string;
  description?: string;
  type?: string;
  interventionNames: string[];
}

interface Intervention {
  type: InterventionType;
  name: string;
  description: string;
  armGroupLabels: string[];
}

interface OutcomesModule {
  primaryOutcomes: Outcome[];
  secondaryOutcomes?: Outcome[];
}

interface Outcome {
  measure: string;
  description?: string;
  timeFrame: string;
}

interface EligibilityModule {
  eligibilityCriteria: string;
  healthyVolunteers: boolean;
  sex: Sex;
  minimumAge: string;
  maximumAge?: string;
  stdAges: StandardAge[];
  studyPopulation?: string;
  samplingMethod?: SamplingMethod;
}

interface ContactsLocationsModule {
  centralContacts?: Contact[];
  overallOfficials?: Official[];
  locations: Location[];
}

interface Contact {
  name: string;
  role: string;
  phone?: string;
  phoneExt?: string;
  email?: string;
}

interface Official {
  name: string;
  affiliation?: string;
  role: string;
}

interface Location {
  facility: string;
  status?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  contacts?: Contact[];
  geoPoint?: {
    lat: number;
    lon: number;
  };
}

interface ReferencesModule {
  references: Reference[];
  seeAlsoLinks?: SeeAlsoLink[];
}

interface Reference {
  pmid?: string;
  type: string;
  citation: string;
}

interface SeeAlsoLink {
  label: string;
  url: string;
}

interface IPDSharingStatementModule {
  ipdSharing: IPDSharing;
  description?: string;
  infoTypes?: string[];
  timeFrame?: string;
  accessCriteria?: string;
  url?: string;
}

interface DerivedSection {
  miscInfoModule: { versionHolder: string };
  conditionBrowseModule: ConditionBrowseModule;
  interventionBrowseModule?: InterventionBrowseModule;
}

interface ConditionBrowseModule {
  meshes: Mesh[];
  ancestors: Mesh[];
  browseLeaves: BrowseLeaf[];
  browseBranches: BrowseBranch[];
}

interface InterventionBrowseModule {
  meshes: Mesh[];
  ancestors: Mesh[];
  browseLeaves: BrowseLeaf[];
  browseBranches: BrowseBranch[];
}

interface Mesh {
  id: string;
  term: string;
}

interface BrowseLeaf {
  id: string;
  name: string;
  asFound?: string;
  relevance: string;
}

interface BrowseBranch {
  abbrev: string;
  name: string;
}

export interface ClinicalTrial {
  protocolSection: ProtocolSection;
  derivedSection: DerivedSection;
  hasResults: boolean;
}
