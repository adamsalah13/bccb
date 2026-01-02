-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'POLYTECHNIC', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('MICRO_CREDENTIAL', 'CERTIFICATE', 'DIPLOMA', 'BADGE', 'SPECIALIZATION');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID', 'SELF_PACED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED', 'GRADUATE');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BloomLevel" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');

-- CreateEnum
CREATE TYPE "OutcomeCategory" AS ENUM ('KNOWLEDGE', 'SKILLS', 'COMPETENCIES', 'ATTITUDES');

-- CreateEnum
CREATE TYPE "RecognitionType" AS ENUM ('FULL_CREDIT', 'PARTIAL_CREDIT', 'EQUIVALENCY', 'EXEMPTION', 'ADVANCED_STANDING');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('ELECTIVE', 'PROGRAM_REQUIRED', 'GENERAL_EDUCATION', 'MAJOR_REQUIRED');

-- CreateEnum
CREATE TYPE "TranscriptMethod" AS ENUM ('LISTED_ON_TRANSCRIPT', 'SEPARATE_DOCUMENT', 'DIGITAL_BADGE', 'NOT_RECORDED');

-- CreateEnum
CREATE TYPE "PathwayType" AS ENUM ('INTERNAL', 'EXTERNAL', 'ARTICULATION', 'LADDERING');

-- CreateEnum
CREATE TYPE "PathwayStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PrerequisiteType" AS ENUM ('ACADEMIC', 'WORK_EXPERIENCE', 'CERTIFICATION', 'COURSE_COMPLETION', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTITUTION_ADMIN', 'PROGRAM_COORDINATOR', 'USER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Canada',
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_credentials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "description" TEXT NOT NULL,
    "programCode" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "credentialType" "CredentialType" NOT NULL,
    "deliveryMode" "DeliveryMode" NOT NULL,
    "duration" INTEGER NOT NULL,
    "credits" DOUBLE PRECISION,
    "assessmentMethod" TEXT,
    "cost" DOUBLE PRECISION,
    "language" TEXT NOT NULL DEFAULT 'English',
    "level" "EducationLevel" NOT NULL,
    "campus" TEXT,
    "department" TEXT,
    "faculty" TEXT,
    "status" "CredentialStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "lastReviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "programUrl" TEXT,
    "applicationUrl" TEXT,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "micro_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_outcomes" (
    "id" TEXT NOT NULL,
    "microCredentialId" TEXT NOT NULL,
    "outcomeText" TEXT NOT NULL,
    "bloomLevel" "BloomLevel" NOT NULL,
    "category" "OutcomeCategory" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "embeddings" DOUBLE PRECISION[],
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognitions" (
    "id" TEXT NOT NULL,
    "microCredentialId" TEXT NOT NULL,
    "recognizingInstitutionId" TEXT NOT NULL,
    "recognitionType" "RecognitionType" NOT NULL,
    "creditValue" DOUBLE PRECISION,
    "creditType" "CreditType",
    "transcriptMethod" "TranscriptMethod" NOT NULL,
    "conditions" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvalReference" TEXT,
    "notes" TEXT,
    "badgeUrl" TEXT,
    "certificateTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pathways" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceInstitutionId" TEXT NOT NULL,
    "targetInstitutionId" TEXT NOT NULL,
    "microCredentialId" TEXT NOT NULL,
    "pathwayType" "PathwayType" NOT NULL,
    "transferCredits" DOUBLE PRECISION,
    "equivalencyNotes" TEXT,
    "additionalRequirements" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "isAiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "status" "PathwayStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pathways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prerequisites" (
    "id" TEXT NOT NULL,
    "microCredentialId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PrerequisiteType" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "institutionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "changes" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_code_key" ON "institutions"("code");

-- CreateIndex
CREATE INDEX "institutions_code_idx" ON "institutions"("code");

-- CreateIndex
CREATE INDEX "institutions_type_idx" ON "institutions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "micro_credentials_programCode_key" ON "micro_credentials"("programCode");

-- CreateIndex
CREATE INDEX "micro_credentials_institutionId_idx" ON "micro_credentials"("institutionId");

-- CreateIndex
CREATE INDEX "micro_credentials_programCode_idx" ON "micro_credentials"("programCode");

-- CreateIndex
CREATE INDEX "micro_credentials_status_idx" ON "micro_credentials"("status");

-- CreateIndex
CREATE INDEX "micro_credentials_credentialType_idx" ON "micro_credentials"("credentialType");

-- CreateIndex
CREATE INDEX "learning_outcomes_microCredentialId_idx" ON "learning_outcomes"("microCredentialId");

-- CreateIndex
CREATE INDEX "recognitions_microCredentialId_idx" ON "recognitions"("microCredentialId");

-- CreateIndex
CREATE INDEX "recognitions_recognizingInstitutionId_idx" ON "recognitions"("recognizingInstitutionId");

-- CreateIndex
CREATE INDEX "recognitions_recognitionType_idx" ON "recognitions"("recognitionType");

-- CreateIndex
CREATE INDEX "pathways_sourceInstitutionId_idx" ON "pathways"("sourceInstitutionId");

-- CreateIndex
CREATE INDEX "pathways_targetInstitutionId_idx" ON "pathways"("targetInstitutionId");

-- CreateIndex
CREATE INDEX "pathways_microCredentialId_idx" ON "pathways"("microCredentialId");

-- CreateIndex
CREATE INDEX "pathways_pathwayType_idx" ON "pathways"("pathwayType");

-- CreateIndex
CREATE INDEX "prerequisites_microCredentialId_idx" ON "prerequisites"("microCredentialId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_institutionId_idx" ON "users"("institutionId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "micro_credentials" ADD CONSTRAINT "micro_credentials_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_outcomes" ADD CONSTRAINT "learning_outcomes_microCredentialId_fkey" FOREIGN KEY ("microCredentialId") REFERENCES "micro_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_microCredentialId_fkey" FOREIGN KEY ("microCredentialId") REFERENCES "micro_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_recognizingInstitutionId_fkey" FOREIGN KEY ("recognizingInstitutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathways" ADD CONSTRAINT "pathways_sourceInstitutionId_fkey" FOREIGN KEY ("sourceInstitutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathways" ADD CONSTRAINT "pathways_targetInstitutionId_fkey" FOREIGN KEY ("targetInstitutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathways" ADD CONSTRAINT "pathways_microCredentialId_fkey" FOREIGN KEY ("microCredentialId") REFERENCES "micro_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prerequisites" ADD CONSTRAINT "prerequisites_microCredentialId_fkey" FOREIGN KEY ("microCredentialId") REFERENCES "micro_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
