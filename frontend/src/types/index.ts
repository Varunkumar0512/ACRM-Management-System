export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type FacultyDesignation =
  | 'Assistant Professor'
  | 'Associate Professor'
  | 'Professor'
  | 'Distinguished Professor'
  | 'Dean of Research';

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'FINAL_REVIEW'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ARCHIVED';

export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

export type DocumentType =
  | 'PROBLEM_STATEMENT'
  | 'LITERATURE_SURVEY'
  | 'SYSTEM_DESIGN'
  | 'RESEARCH_PROPOSAL'
  | 'PROGRESS_REPORT'
  | 'FINAL_REPORT'
  | 'PRESENTATION'
  | 'OTHER';

export type ReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';

export interface IUser {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  googleId?: string;
  createdAt?: string;
}

export interface IStudentProfile {
  _id?: string;
  studentId: string;
  department: string;
  program: string;
  yearOfStudy: number;
  cgpa?: number;
  researchInterests: string[];
  bio?: string;
}

export interface IFacultyProfile {
  _id?: string;
  employeeId: string;
  designation: FacultyDesignation;
  department: string;
  experienceYears: number;
  areasOfExpertise: string[];
  currentResearchSummary?: string;
  maxActiveProjectsGuide: number;
  currentActiveProjectsCount: number;
  isAvailableForGuidance: boolean;
  cabinLocation?: string;
  googleScholarUrl?: string;
  userId?: IUser;
}

export interface IResearchDomain {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  orderIndex: number;
  topicCount?: number;
  paperCount?: number;
  ideaCount?: number;
}

export interface IResearchTopic {
  _id: string;
  title: string;
  slug: string;
  domainId: IResearchDomain;
  description: string;
  subtopics: string[];
  trendingScore: number;
  keywords: string[];
}

export interface IResearchPaper {
  _id: string;
  title: string;
  authors: string[];
  domainId: IResearchDomain;
  department: string;
  venue: string;
  publicationDate: string;
  doi?: string;
  externalUrl?: string;
  keywords: string[];
  tags: string[];
  citationsCount: number;
  savedCount: number;
  abstract: string;
}

export interface IProjectIdea {
  _id: string;
  title: string;
  slug: string;
  domainId: IResearchDomain;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  problemStatement: string;
  objectives: string[];
  technologies: string[];
  expectedOutcome: string;
  prerequisites: string[];
  tags: string[];
  isCurated: boolean;
  savedCount: number;
}

export interface IProject {
  _id: string;
  code: string;
  title: string;
  domainId: IResearchDomain;
  department: string;
  problemStatement: string;
  objectives: string[];
  technologies: string[];
  status: ProjectStatus;
  progressPercentage: number;
  ownerId: IUser;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  repositoryUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMilestone {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  orderIndex: number;
  dueDate: string;
  completionDate?: string;
  status: MilestoneStatus;
  assignedMemberIds: IUser[];
  weight: number;
}

export interface IDocument {
  _id: string;
  projectId: string;
  milestoneId?: { _id: string; title: string };
  filename: string;
  originalName: string;
  type: DocumentType;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  version: number;
  uploadedBy: IUser;
  status: string;
  description?: string;
  createdAt: string;
}

export interface IComment {
  _id: string;
  projectId: string;
  authorId: IUser;
  content: string;
  status: 'OPEN' | 'RESOLVED';
  parentCommentId?: string;
  resolvedBy?: IUser;
  resolvedAt?: string;
  createdAt: string;
}

export interface IRubricScore {
  criterion: string;
  score: number;
  maxScore: number;
  comments?: string;
}

export interface IReview {
  _id: string;
  projectId: string;
  reviewerId: IUser;
  milestoneId?: { _id: string; title: string };
  rubricScores: IRubricScore[];
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  comments: string;
  recommendations: string;
  decision: ReviewDecision;
  version: number;
  createdAt: string;
}

export interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ISupportTicket {
  _id: string;
  ticketNumber: string;
  userId: IUser;
  category: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  messages: { senderId: IUser; message: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export type NoveltyAssessment =
  | 'POTENTIALLY_DISTINCT'
  | 'SOME_SIMILARITIES_FOUND'
  | 'SIGNIFICANT_SIMILARITIES_FOUND'
  | 'INSUFFICIENT_INFORMATION'
  | 'FURTHER_REVIEW_RECOMMENDED';

export type NoveltyConfidence = 'HIGH' | 'MODERATE' | 'LOW' | 'PRELIMINARY';

export type IprCategory = 'PATENT' | 'COPYRIGHT' | 'TRADEMARK' | 'INVENTION' | 'OTHER';

export type IprStatus =
  | 'SUBMITTED'
  | 'INITIAL_REVIEW'
  | 'INFORMATION_REQUESTED'
  | 'ASSESSMENT'
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'APPLICATION_IN_PROGRESS'
  | 'FILED'
  | 'GRANTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

export type IprConfidentiality =
  | 'PRIVATE'
  | 'INSTITUTION_ONLY'
  | 'AUTHORIZED_FACULTY'
  | 'AUTHORIZED_IPR_REVIEWERS'
  | 'APPROVED_PUBLIC';

export interface INoveltyScreening {
  _id: string;
  screeningNumber: string;
  projectId: any;
  submittedBy: IUser;
  innovationTitle: string;
  problem: string;
  proposedSolution: string;
  keyTechnicalFeatures: string[];
  differentiation: string;
  technologiesUsed: string[];
  targetApplication: string;
  relatedResearch?: string;
  assessment: NoveltyAssessment;
  confidence: NoveltyConfidence;
  distinguishingFeatures: string[];
  potentialOverlap: string;
  recommendedNextSteps: string[];
  sourcesConsulted: {
    papersCount: number;
    patentRecordsCount: number;
    institutionalCount: number;
    externalConnected: boolean;
    message: string;
    sampleSources: Array<{ title: string; type: string; citationOrDoi?: string }>;
  };
  chatHistory: Array<{ role: 'assistant' | 'user'; content: string; timestamp: string }>;
  questions: string[];
  studentAcknowledged: boolean;
  acknowledgedAt?: string;
  status: 'DRAFT' | 'COMPLETED' | 'FAILED';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IIPRDisclosure {
  _id: string;
  iprNumber: string;
  title: string;
  category: IprCategory;
  projectId: any;
  screeningId: any;
  status: IprStatus;
  confidentiality: IprConfidentiality;
  summary: string;
  commercialPotential?: string;
  stageOfDevelopment?: string;
  primaryInventorId: IUser;
  coInventors: Array<{ userId?: string; name: string; email: string; department?: string; sharePercentage?: number }>;
  assignedReviewerId?: IUser;
  filingDetails?: {
    applicationNumber?: string;
    filingDate?: string;
    authority?: string;
    status?: string;
    notes?: string;
  };
  acknowledgementAccepted: boolean;
  acknowledgedAt?: string;
  history: Array<{ fromStatus?: IprStatus; toStatus: IprStatus; changedBy: any; timestamp: string; notes?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface IIPRDocument {
  _id: string;
  iprId: string;
  originalName: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  type: string;
  version: number;
  uploadedBy: IUser;
  description?: string;
  createdAt: string;
}

export interface IIPRComment {
  _id: string;
  iprId: string;
  authorId: IUser;
  message: string;
  relatedSection: string;
  status: 'OPEN' | 'RESOLVED';
  parentCommentId?: string;
  resolvedBy?: IUser;
  resolvedAt?: string;
  createdAt: string;
}

export interface IIPRApplication {
  _id: string;
  iprId: string;
  applicationNumber: string;
  filingDate: string;
  authority: string;
  applicationType: string;
  status: string;
  publicationNumber?: string;
  publicationDate?: string;
  grantNumber?: string;
  grantDate?: string;
  attorneyOrAgent?: string;
  notes?: string;
  createdAt: string;
}

