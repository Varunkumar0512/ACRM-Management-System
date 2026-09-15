import { z } from 'zod';

export const createDomainSchema = z.object({
  name: z.string().min(2, 'Domain name is required').trim(),
  description: z.string().min(10, 'Domain description is required'),
  icon: z.string().optional().default('BookOpen'),
  orderIndex: z.number().int().optional().default(0),
});

export const createTopicSchema = z.object({
  title: z.string().min(2, 'Topic title is required').trim(),
  domainId: z.string().min(1, 'Domain ID is required'),
  description: z.string().min(10, 'Description is required'),
  subtopics: z.array(z.string()).optional().default([]),
  trendingScore: z.number().min(0).max(100).optional().default(50),
  keywords: z.array(z.string()).optional().default([]),
});

export const createPaperSchema = z.object({
  title: z.string().min(5, 'Paper title is required').trim(),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  abstract: z.string().min(20, 'Abstract is required'),
  domainId: z.string().min(1, 'Domain ID is required'),
  department: z.string().min(2, 'Department is required'),
  venue: z.string().min(2, 'Publication venue is required'),
  publicationDate: z.string().datetime(),
  doi: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  keywords: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  citationsCount: z.number().int().min(0).optional().default(0),
});

export const createProjectIdeaSchema = z.object({
  title: z.string().min(5, 'Idea title is required').trim(),
  domainId: z.string().min(1, 'Domain is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  problemStatement: z.string().min(20, 'Problem statement is required'),
  objectives: z.array(z.string()).min(1, 'Objectives are required'),
  technologies: z.array(z.string()).min(1, 'Technologies are required'),
  expectedOutcome: z.string().min(10, 'Expected outcome is required'),
  prerequisites: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const saveItemSchema = z.object({
  itemType: z.enum(['PAPER', 'TOPIC', 'IDEA']),
  itemId: z.string().min(1, 'Item ID is required'),
  notes: z.string().optional(),
});
