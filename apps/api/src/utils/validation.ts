import { z } from 'zod';

// Micro-Credential validation schemas
export const createMicroCredentialSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  shortTitle: z.string().max(100).optional(),
  description: z.string().min(1, 'Description is required'),
  programCode: z.string().min(1, 'Program code is required'),
  institutionId: z.string().uuid('Invalid institution ID'),
  credentialType: z.enum(['MICRO_CREDENTIAL', 'CERTIFICATE', 'DIPLOMA', 'BADGE', 'SPECIALIZATION']),
  deliveryMode: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID', 'SELF_PACED']),
  duration: z.number().int().positive('Duration must be positive'),
  credits: z.number().positive().optional(),
  assessmentMethod: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  language: z.string().default('English'),
  level: z.enum(['INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED', 'GRADUATE']),
  campus: z.string().optional(),
  department: z.string().optional(),
  faculty: z.string().optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  effectiveDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  programUrl: z.string().url().optional(),
  applicationUrl: z.string().url().optional(),
  additionalInfo: z.string().optional(),
});

export const updateMicroCredentialSchema = createMicroCredentialSchema.partial();

// Pathway validation schemas
export const createPathwaySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  sourceInstitutionId: z.string().uuid('Invalid source institution ID'),
  targetInstitutionId: z.string().uuid('Invalid target institution ID'),
  microCredentialId: z.string().uuid('Invalid micro-credential ID'),
  pathwayType: z.enum(['INTERNAL', 'EXTERNAL', 'ARTICULATION', 'LADDERING']),
  transferCredits: z.number().nonnegative().optional(),
  equivalencyNotes: z.string().optional(),
  additionalRequirements: z.string().optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']).default('DRAFT'),
});

export const updatePathwaySchema = createPathwaySchema.partial();

// Recognition validation schemas
export const createRecognitionSchema = z.object({
  microCredentialId: z.string().uuid('Invalid micro-credential ID'),
  recognizingInstitutionId: z.string().uuid('Invalid institution ID'),
  recognitionType: z.enum(['FULL_CREDIT', 'PARTIAL_CREDIT', 'EQUIVALENCY', 'EXEMPTION', 'ADVANCED_STANDING']),
  creditValue: z.number().positive().optional(),
  creditType: z.enum(['ELECTIVE', 'PROGRAM_REQUIRED', 'GENERAL_EDUCATION', 'MAJOR_REQUIRED']).optional(),
  transcriptMethod: z.enum(['LISTED_ON_TRANSCRIPT', 'SEPARATE_DOCUMENT', 'DIGITAL_BADGE', 'NOT_RECORDED']),
  conditions: z.string().optional(),
  effectiveDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  approvalReference: z.string().optional(),
  notes: z.string().optional(),
  badgeUrl: z.string().url().optional(),
});

export const updateRecognitionSchema = createRecognitionSchema.partial();

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const credentialFilterSchema = paginationSchema.extend({
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  institutionId: z.string().uuid().optional(),
  credentialType: z.enum(['MICRO_CREDENTIAL', 'CERTIFICATE', 'DIPLOMA', 'BADGE', 'SPECIALIZATION']).optional(),
  level: z.enum(['INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED', 'GRADUATE']).optional(),
  search: z.string().optional(),
});

export const pathwayFilterSchema = paginationSchema.extend({
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  sourceInstitutionId: z.string().uuid().optional(),
  targetInstitutionId: z.string().uuid().optional(),
  pathwayType: z.enum(['INTERNAL', 'EXTERNAL', 'ARTICULATION', 'LADDERING']).optional(),
  microCredentialId: z.string().uuid().optional(),
});

export const recognitionFilterSchema = paginationSchema.extend({
  microCredentialId: z.string().uuid().optional(),
  recognizingInstitutionId: z.string().uuid().optional(),
  recognitionType: z.enum(['FULL_CREDIT', 'PARTIAL_CREDIT', 'EQUIVALENCY', 'EXEMPTION', 'ADVANCED_STANDING']).optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
});
