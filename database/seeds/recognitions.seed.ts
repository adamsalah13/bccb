/**
 * Recognitions Seed Data
 * 
 * Seeds recognition agreements between institutions
 */

import { prisma } from '../utils/client';
import {
  RecognitionType,
  CreditType,
  TranscriptMethod,
} from '@prisma/client';

export const recognitionsSeedData = [
  {
    microCredentialCode: 'BCIT-BIO-101',
    recognizingInstitutionCode: 'UBC',
    recognitionType: RecognitionType.PARTIAL_CREDIT,
    creditValue: 3.0,
    creditType: CreditType.ELECTIVE,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'Must achieve minimum grade of B+ (77%) in the micro-credential',
    effectiveDate: new Date('2024-01-01'),
    isActive: true,
    approvalReference: 'UBC-BCIT-2024-001',
    notes: 'Recognized as 3 credits towards Biology electives',
  },
  {
    microCredentialCode: 'BCIT-MKT-201',
    recognizingInstitutionCode: 'SFU',
    recognitionType: RecognitionType.EQUIVALENCY,
    creditValue: 3.0,
    creditType: CreditType.PROGRAM_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'Completion within last 5 years',
    effectiveDate: new Date('2024-01-15'),
    isActive: true,
    approvalReference: 'SFU-BCIT-2024-002',
    notes: 'Equivalent to BUS 251 - Digital Marketing',
  },
  {
    microCredentialCode: 'BCIT-CST-301',
    recognizingInstitutionCode: 'DOUGLAS',
    recognitionType: RecognitionType.FULL_CREDIT,
    creditValue: 3.5,
    creditType: CreditType.MAJOR_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'None',
    effectiveDate: new Date('2024-02-01'),
    isActive: true,
    approvalReference: 'DOUGLAS-BCIT-2024-003',
    notes: 'Full credit for CST 115 - Data Analytics',
  },
  {
    microCredentialCode: 'DOUGLAS-WEB-101',
    recognizingInstitutionCode: 'BCIT',
    recognitionType: RecognitionType.PARTIAL_CREDIT,
    creditValue: 2.0,
    creditType: CreditType.ELECTIVE,
    transcriptMethod: TranscriptMethod.DIGITAL_BADGE,
    conditions: 'Completion with minimum 70%',
    effectiveDate: new Date('2024-02-15'),
    isActive: true,
    approvalReference: 'BCIT-DOUGLAS-2024-004',
    badgeUrl: 'https://badges.bcit.ca/web-dev-recognition',
    notes: 'Recognized with digital badge, 2 elective credits',
  },
  {
    microCredentialCode: 'SFU-BUS-201',
    recognizingInstitutionCode: 'BCIT',
    recognitionType: RecognitionType.ADVANCED_STANDING,
    creditValue: 4.0,
    creditType: CreditType.PROGRAM_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'For admission to Business Analytics programs',
    effectiveDate: new Date('2024-01-10'),
    isActive: true,
    approvalReference: 'BCIT-SFU-2024-005',
    notes: 'Provides advanced standing in Business Analytics certificate',
  },
  {
    microCredentialCode: 'BCIT-CST-601',
    recognizingInstitutionCode: 'UBC',
    recognitionType: RecognitionType.EXEMPTION,
    creditValue: null,
    creditType: null,
    transcriptMethod: TranscriptMethod.NOT_RECORDED,
    conditions: 'Exempts from prerequisite for advanced cybersecurity courses',
    effectiveDate: new Date('2024-02-20'),
    isActive: true,
    approvalReference: 'UBC-BCIT-2024-006',
    notes: 'Exemption from CPSC 317 prerequisite requirement',
  },
  {
    microCredentialCode: 'LANGARA-DES-101',
    recognizingInstitutionCode: 'SFU',
    recognitionType: RecognitionType.PARTIAL_CREDIT,
    creditValue: 2.5,
    creditType: CreditType.GENERAL_EDUCATION,
    transcriptMethod: TranscriptMethod.SEPARATE_DOCUMENT,
    conditions: 'Must submit portfolio for review',
    effectiveDate: new Date('2024-03-10'),
    isActive: true,
    approvalReference: 'SFU-LANGARA-2024-007',
    notes: 'Credits applied as general education electives',
  },
  {
    microCredentialCode: 'UBC-BUS-301',
    recognizingInstitutionCode: 'DOUGLAS',
    recognitionType: RecognitionType.EQUIVALENCY,
    creditValue: 3.5,
    creditType: CreditType.PROGRAM_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'None',
    effectiveDate: new Date('2024-01-05'),
    isActive: true,
    approvalReference: 'DOUGLAS-UBC-2024-008',
    notes: 'Equivalent to BUS 435 - Sustainable Business',
  },
  {
    microCredentialCode: 'BCIT-MGT-401',
    recognizingInstitutionCode: 'LANGARA',
    recognitionType: RecognitionType.PARTIAL_CREDIT,
    creditValue: 3.0,
    creditType: CreditType.MAJOR_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'Completion within last 3 years',
    effectiveDate: new Date('2024-01-20'),
    isActive: true,
    approvalReference: 'LANGARA-BCIT-2024-009',
    notes: 'Recognized towards Business Management diploma',
  },
  {
    microCredentialCode: 'SFU-CST-401',
    recognizingInstitutionCode: 'UBC',
    recognitionType: RecognitionType.ADVANCED_STANDING,
    creditValue: 4.0,
    creditType: CreditType.MAJOR_REQUIRED,
    transcriptMethod: TranscriptMethod.LISTED_ON_TRANSCRIPT,
    conditions: 'Must achieve minimum B grade',
    effectiveDate: new Date('2024-02-05'),
    isActive: true,
    approvalReference: 'UBC-SFU-2024-010',
    notes: 'Advanced standing for CPSC 340 - Machine Learning',
  },
];

export async function seedRecognitions() {
  console.log('Seeding recognitions...');

  // Get all micro-credentials and institutions
  const microCredentials = await prisma.microCredential.findMany({
    select: { id: true, programCode: true },
  });

  const institutions = await prisma.institution.findMany({
    select: { id: true, code: true },
  });

  const credentialMap = new Map(
    microCredentials.map((cred) => [cred.programCode, cred.id])
  );

  const institutionMap = new Map(
    institutions.map((inst) => [inst.code, inst.id])
  );

  for (const recognitionData of recognitionsSeedData) {
    const {
      microCredentialCode,
      recognizingInstitutionCode,
      ...recognitionFields
    } = recognitionData as any;

    const microCredentialId = credentialMap.get(microCredentialCode);
    const recognizingInstitutionId = institutionMap.get(recognizingInstitutionCode);

    if (!microCredentialId) {
      console.warn(`Micro-credential ${microCredentialCode} not found, skipping recognition`);
      continue;
    }

    if (!recognizingInstitutionId) {
      console.warn(`Institution ${recognizingInstitutionCode} not found, skipping recognition`);
      continue;
    }

    // Note: Using composite ID as workaround since schema doesn't define a unique constraint
    // for the (microCredentialId, recognizingInstitutionId) combination.
    // In production, consider adding @@unique([microCredentialId, recognizingInstitutionId])
    // to the Recognition model in schema.prisma for better data integrity.
    const compositeId = `${microCredentialId}-${recognizingInstitutionId}`;

    await prisma.recognition.upsert({
      where: {
        id: compositeId,
      },
      update: {
        ...recognitionFields,
        microCredentialId,
        recognizingInstitutionId,
      },
      create: {
        id: compositeId,
        ...recognitionFields,
        microCredentialId,
        recognizingInstitutionId,
      },
    });
  }

  console.log(`✓ Seeded ${recognitionsSeedData.length} recognitions`);
}

// Allow running this seed file independently
if (require.main === module) {
  seedRecognitions()
    .catch((e) => {
      console.error('Error seeding recognitions:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
