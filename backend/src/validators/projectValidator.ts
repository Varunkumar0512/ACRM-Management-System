import { z } from 'zod';
import { ProjectStatus, MilestoneStatus, ReviewDecision, GuideRole, DocumentType } from '../config/constants.js';

const dateSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return val;
}, z.string().datetime().optional());

const optionalIdSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  return typeof val === 'string' ? val.trim() : val;
}, z.string().optional());

export const createProjectSchema = z
  .object({
    draftId: optionalIdSchema,
    title: z.string().min(1, 'Project title is required').trim(),
    domainId: optionalIdSchema,
    department: z.string().optional().default(''),
    problemStatement: z.string().optional().default(''),
    objectives: z.array(z.string()).optional().default([]),
    technologies: z.array(z.string()).optional().default([]),
    expectedCompletionDate: dateSchema,
    repositoryUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
    isPublic: z.boolean().optional().default(true),
    fromProjectIdeaId: optionalIdSchema,
    teamMemberIds: z.array(z.string()).optional().default([]),
    teamMemberEmails: z.string().optional().or(z.array(z.string())).optional(),
    facultyGuideId: optionalIdSchema,
    coGuideId: optionalIdSchema,
    asDraft: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.asDraft) {
      // Formal Submission Validations
      if (!data.title || data.title.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['title'],
          message: 'Project title must be at least 3 characters long',
        });
      }
      if (!data.domainId || data.domainId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['domainId'],
          message: 'Research domain is required for formal submission',
        });
      }
      if (!data.department || data.department.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['department'],
          message: 'Academic department is required',
        });
      }
      if (!data.problemStatement || data.problemStatement.trim().length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['problemStatement'],
          message: 'Problem statement must be descriptive (at least 20 characters)',
        });
      }
      const validObjectives = (data.objectives || []).filter((o) => typeof o === 'string' && o.trim().length >= 3);
      if (validObjectives.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['objectives'],
          message: 'At least one project objective (min 3 chars) is required',
        });
      }
      const validTech = (data.technologies || []).filter((t) => typeof t === 'string' && t.trim().length >= 1);
      if (validTech.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['technologies'],
          message: 'At least one technology or tool is required',
        });
      }
    }
  });

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.string().optional(),
  domainId: optionalIdSchema,
  problemStatement: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  expectedCompletionDate: dateSchema,
  repositoryUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
  isPublic: z.boolean().optional(),
  facultyGuideId: optionalIdSchema,
  coGuideId: optionalIdSchema,
  teamMemberEmails: z.string().optional().or(z.array(z.string())).optional(),
  teamMemberIds: z.array(z.string()).optional(),
});

export const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
  reason: z.string().optional(),
});

export const createMilestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title is required').trim(),
  description: z.string().optional().default(''),
  orderIndex: z.number().int().min(0),
  dueDate: z.string().datetime('Valid due date is required'),
  assignedMemberIds: z.array(z.string()).optional().default([]),
  weight: z.number().int().min(1).max(10).optional().default(1),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
  assignedMemberIds: z.array(z.string()).optional(),
  weight: z.number().int().min(1).max(10).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content cannot be empty').trim(),
  referencedMilestoneId: z.string().optional().nullable(),
  referencedDocumentId: z.string().optional().nullable(),
  parentCommentId: z.string().optional().nullable(),
});

export const createReviewSchema = z.object({
  milestoneId: z.string().optional().nullable(),
  rubricScores: z
    .array(
      z.object({
        criterion: z.string().min(1, 'Criterion name is required'),
        score: z.number().min(0),
        maxScore: z.number().min(1),
        comments: z.string().optional().default(''),
      })
    )
    .min(1, 'At least one rubric score item is required'),
  comments: z.string().min(5, 'Review qualitative comments are required'),
  recommendations: z.string().optional().default(''),
  decision: z.nativeEnum(ReviewDecision),
});

export const inviteMemberSchema = z.object({
  studentIdentifier: z.string().min(3, 'Student ID or institutional email is required').trim(),
});

export const requestGuideSchema = z.object({
  facultyId: z.string().min(1, 'Faculty ID is required'),
  role: z.nativeEnum(GuideRole).default(GuideRole.PRIMARY_GUIDE),
  notes: z.string().optional(),
});

export const respondGuideSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});
