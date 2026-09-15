import { z } from 'zod';
import { IprCategory, IprStatus, IprConfidentiality, NoveltyAssessment, NoveltyConfidence } from '../config/constants.js';

export const preliminaryScreeningSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  innovationTitle: z.string().min(3, 'Innovation title must be at least 3 characters').trim(),
  problem: z.string().min(10, 'Problem description must be at least 10 characters').trim(),
  proposedSolution: z.string().min(10, 'Proposed solution must be at least 10 characters').trim(),
  keyTechnicalFeatures: z.array(z.string().trim()).min(1, 'At least one key technical feature is required'),
  differentiation: z.string().min(10, 'Explanation of how it differs from existing solutions is required').trim(),
  technologiesUsed: z.array(z.string().trim()).min(1, 'At least one technology is required'),
  targetApplication: z.string().min(3, 'Target application domain is required').trim(),
  relatedResearch: z.string().optional().default(''),
});

export const noveltyChatSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  screeningId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty').trim(),
  innovationContext: z
    .object({
      innovationTitle: z.string().optional(),
      problem: z.string().optional(),
      proposedSolution: z.string().optional(),
      differentiation: z.string().optional(),
    })
    .optional(),
});

export const noveltyAcknowledgeSchema = z.object({
  acknowledged: z.literal(true, {
    errorMap: () => ({ message: 'You must explicitly acknowledge the preliminary nature of this screening.' }),
  }),
});

export const iprDisclosureCreateSchema = z.object({
  title: z.string().min(3, 'Disclosure title must be at least 3 characters').trim(),
  category: z.nativeEnum(IprCategory),
  projectId: z.string().min(1, 'Project reference is required'),
  screeningId: z.string().min(1, 'Completed AI novelty screening reference is required'),
  confidentiality: z.nativeEnum(IprConfidentiality).optional().default(IprConfidentiality.INSTITUTION_ONLY),
  summary: z.string().min(15, 'Innovation summary must be at least 15 characters').trim(),
  commercialPotential: z.string().optional().default(''),
  stageOfDevelopment: z.string().optional().default('LAB_PROTOTYPE'),
  coInventors: z
    .array(
      z.object({
        userId: z.string().optional(),
        name: z.string().min(2, 'Inventor name is required').trim(),
        email: z.string().email('Valid inventor email is required').toLowerCase().trim(),
        department: z.string().optional().default(''),
        sharePercentage: z.number().min(0).max(100).optional().default(0),
      })
    )
    .optional()
    .default([]),
  acknowledgementAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge that this IPR disclosure does not constitute a guaranteed patent.' }),
  }),
});

export const iprStatusUpdateSchema = z.object({
  status: z.nativeEnum(IprStatus),
  notes: z.string().optional(),
});

export const iprReviewSchema = z.object({
  decision: z.enum(['RECOMMENDED', 'INFORMATION_REQUESTED', 'APPROVED', 'REJECTED']),
  comments: z.string().min(5, 'Review comments must be at least 5 characters').trim(),
  recommendations: z.string().optional().default(''),
  technicalMeritScore: z.number().min(1).max(10).optional().default(8),
  commercialViabilityScore: z.number().min(1).max(10).optional().default(7),
  priorArtRiskScore: z.number().min(1).max(10).optional().default(3),
});

export const iprCommentSchema = z.object({
  message: z.string().min(1, 'Comment message cannot be empty').trim(),
  relatedSection: z.string().optional().default('general'),
  parentCommentId: z.string().optional(),
});

export const iprApplicationSchema = z.object({
  applicationNumber: z.string().min(3, 'Official Application/Filing Number is required').trim(),
  filingDate: z.string().optional(),
  authority: z.string().min(2, 'Filing authority is required').trim(),
  applicationType: z.string().min(2, 'Application type is required').trim(),
  status: z.string().optional().default('FILED'),
  publicationNumber: z.string().optional().default(''),
  publicationDate: z.string().optional(),
  grantNumber: z.string().optional().default(''),
  grantDate: z.string().optional(),
  attorneyOrAgent: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});
