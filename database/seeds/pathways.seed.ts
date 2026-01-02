/**
 * Pathways Seed Data
 * 
 * Seeds educational pathways between institutions
 */

import { prisma } from '../utils/client';
import { PathwayType, PathwayStatus } from '@prisma/client';

export const pathwaysSeedData = [
  {
    name: 'BCIT Cell Culture to UBC Biotechnology',
    description: 'Pathway from BCIT Animal Cell Culture credential to UBC Biotechnology programs with advanced standing',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'UBC',
    microCredentialCode: 'BCIT-BIO-101',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 3.0,
    equivalencyNotes: 'Recognized as equivalent to BIOL 200 - Introduction to Cell Biology',
    additionalRequirements: 'Student must meet UBC admission requirements',
    confidenceScore: 0.92,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'UBC Transfer Credit Assessment Office',
    approvedAt: new Date('2024-01-15'),
  },
  {
    name: 'BCIT Digital Marketing to SFU Business',
    description: 'Articulation pathway from BCIT Digital Marketing to SFU Business programs',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'SFU',
    microCredentialCode: 'BCIT-MKT-201',
    pathwayType: PathwayType.ARTICULATION,
    transferCredits: 3.0,
    equivalencyNotes: 'Full credit towards BUS 251',
    additionalRequirements: 'Minimum B grade required',
    confidenceScore: 0.88,
    isAiSuggested: false,
    status: PathwayStatus.ACTIVE,
    isActive: true,
    approvedBy: 'SFU Business Articulation Committee',
    approvedAt: new Date('2024-01-20'),
  },
  {
    name: 'BCIT Python Analytics to Douglas CS Diploma',
    description: 'Credit transfer from BCIT Python Analytics to Douglas College Computer Science',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'DOUGLAS',
    microCredentialCode: 'BCIT-CST-301',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 3.5,
    equivalencyNotes: 'Full transfer credit for CST 115',
    additionalRequirements: null,
    confidenceScore: 0.95,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'Douglas College Registrar',
    approvedAt: new Date('2024-02-01'),
  },
  {
    name: 'Douglas Web Dev to BCIT Web Development Program',
    description: 'Pathway from Douglas Web Development credential to BCIT advanced web development programs',
    sourceInstitutionCode: 'DOUGLAS',
    targetInstitutionCode: 'BCIT',
    microCredentialCode: 'DOUGLAS-WEB-101',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 2.0,
    equivalencyNotes: 'Partial credit towards COMP 1850',
    additionalRequirements: 'Portfolio review required for full admission',
    confidenceScore: 0.78,
    isAiSuggested: true,
    aiReasoning: 'Learning outcomes show 85% overlap with BCIT COMP 1850 content based on semantic analysis',
    status: PathwayStatus.UNDER_REVIEW,
    isActive: true,
    approvedBy: null,
    approvedAt: null,
  },
  {
    name: 'BCIT Cloud Computing to Advanced Cloud Specialization',
    description: 'Internal BCIT pathway to advanced cloud computing specializations',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'BCIT',
    microCredentialCode: 'BCIT-CST-501',
    pathwayType: PathwayType.INTERNAL,
    transferCredits: 2.5,
    equivalencyNotes: 'Prerequisite waiver for advanced cloud courses',
    additionalRequirements: null,
    confidenceScore: 1.0,
    isAiSuggested: false,
    status: PathwayStatus.ACTIVE,
    isActive: true,
    approvedBy: 'BCIT School of Computing',
    approvedAt: new Date('2024-03-01'),
  },
  {
    name: 'SFU Business Analytics to UBC Data Science',
    description: 'Transfer pathway from SFU Business Analytics to UBC Data Science programs',
    sourceInstitutionCode: 'SFU',
    targetInstitutionCode: 'UBC',
    microCredentialCode: 'SFU-BUS-201',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 4.0,
    equivalencyNotes: 'Advanced standing for DSCI 100 and partial credit for STAT 200',
    additionalRequirements: 'Must meet UBC program admission requirements',
    confidenceScore: 0.89,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'UBC Faculty of Science',
    approvedAt: new Date('2024-01-25'),
  },
  {
    name: 'BCIT Cybersecurity to UBC Computer Science',
    description: 'Pathway providing prerequisite exemption for advanced cybersecurity courses at UBC',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'UBC',
    microCredentialCode: 'BCIT-CST-601',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: null,
    equivalencyNotes: 'Exemption from CPSC 317 prerequisite',
    additionalRequirements: 'Must be enrolled in UBC Computer Science program',
    confidenceScore: 0.91,
    isAiSuggested: false,
    status: PathwayStatus.ACTIVE,
    isActive: true,
    approvedBy: 'UBC CS Department',
    approvedAt: new Date('2024-02-20'),
  },
  {
    name: 'Langara UX/UI Design to SFU Interactive Arts',
    description: 'Articulation from Langara Design to SFU School of Interactive Arts and Technology',
    sourceInstitutionCode: 'LANGARA',
    targetInstitutionCode: 'SFU',
    microCredentialCode: 'LANGARA-DES-101',
    pathwayType: PathwayType.ARTICULATION,
    transferCredits: 2.5,
    equivalencyNotes: 'General education credit, portfolio required for program admission',
    additionalRequirements: 'Portfolio submission and review',
    confidenceScore: 0.82,
    isAiSuggested: true,
    aiReasoning: 'Design principles align with SFU IAT foundations based on outcome mapping',
    status: PathwayStatus.UNDER_REVIEW,
    isActive: true,
    approvedBy: null,
    approvedAt: null,
  },
  {
    name: 'UBC Sustainability to Douglas Business Programs',
    description: 'Credit transfer from UBC Sustainable Business to Douglas College business programs',
    sourceInstitutionCode: 'UBC',
    targetInstitutionCode: 'DOUGLAS',
    microCredentialCode: 'UBC-BUS-301',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 3.5,
    equivalencyNotes: 'Full equivalency to BUS 435',
    additionalRequirements: null,
    confidenceScore: 0.94,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'Douglas College Business Department',
    approvedAt: new Date('2024-01-10'),
  },
  {
    name: 'BCIT Project Management to Langara Business',
    description: 'Pathway from BCIT Project Management to Langara Business Management programs',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'LANGARA',
    microCredentialCode: 'BCIT-MGT-401',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 3.0,
    equivalencyNotes: 'Credit towards Business Management diploma requirements',
    additionalRequirements: 'Completion within 3 years',
    confidenceScore: 0.86,
    isAiSuggested: false,
    status: PathwayStatus.ACTIVE,
    isActive: true,
    approvedBy: 'Langara Business Programs',
    approvedAt: new Date('2024-01-22'),
  },
  {
    name: 'SFU Machine Learning to UBC Computer Science',
    description: 'Advanced standing pathway from SFU ML to UBC CS graduate programs',
    sourceInstitutionCode: 'SFU',
    targetInstitutionCode: 'UBC',
    microCredentialCode: 'SFU-CST-401',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 4.0,
    equivalencyNotes: 'Advanced standing for CPSC 340',
    additionalRequirements: 'Minimum B grade and program admission',
    confidenceScore: 0.93,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'UBC CS Graduate Committee',
    approvedAt: new Date('2024-02-05'),
  },
  {
    name: 'Douglas Supply Chain to BCIT Operations Management',
    description: 'Articulation pathway from Douglas Supply Chain to BCIT Operations programs',
    sourceInstitutionCode: 'DOUGLAS',
    targetInstitutionCode: 'BCIT',
    microCredentialCode: 'DOUGLAS-BUS-201',
    pathwayType: PathwayType.ARTICULATION,
    transferCredits: 3.0,
    equivalencyNotes: 'Credit towards Operations Management certificate',
    additionalRequirements: null,
    confidenceScore: 0.87,
    isAiSuggested: true,
    aiReasoning: 'Strong alignment between supply chain and operations management outcomes',
    status: PathwayStatus.UNDER_REVIEW,
    isActive: true,
    approvedBy: null,
    approvedAt: null,
  },
  {
    name: 'UBC Health Informatics to BCIT Health IT Programs',
    description: 'Transfer pathway from UBC Health Informatics to BCIT Health Information Technology',
    sourceInstitutionCode: 'UBC',
    targetInstitutionCode: 'BCIT',
    microCredentialCode: 'UBC-HLT-201',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 3.0,
    equivalencyNotes: 'Credit towards Health Information Management diploma',
    additionalRequirements: 'Healthcare background preferred',
    confidenceScore: 0.90,
    isAiSuggested: false,
    status: PathwayStatus.APPROVED,
    isActive: true,
    approvedBy: 'BCIT Health Sciences',
    approvedAt: new Date('2024-02-12'),
  },
  {
    name: 'BCIT Renewable Energy to SFU Environmental Programs',
    description: 'Pathway from BCIT Renewable Energy to SFU Environmental Science and Resource Management',
    sourceInstitutionCode: 'BCIT',
    targetInstitutionCode: 'SFU',
    microCredentialCode: 'BCIT-ENG-501',
    pathwayType: PathwayType.EXTERNAL,
    transferCredits: 4.5,
    equivalencyNotes: 'Credit towards Environmental Engineering courses',
    additionalRequirements: 'Engineering background required',
    confidenceScore: 0.85,
    isAiSuggested: true,
    aiReasoning: 'High correlation between renewable energy systems and SFU environmental engineering curriculum',
    status: PathwayStatus.DRAFT,
    isActive: false,
    approvedBy: null,
    approvedAt: null,
  },
  {
    name: 'Langara Indigenous Business to Douglas Business Diploma',
    description: 'Pathway from Langara Indigenous Business to Douglas College Business Diploma with specialty recognition',
    sourceInstitutionCode: 'LANGARA',
    targetInstitutionCode: 'DOUGLAS',
    microCredentialCode: 'LANGARA-BUS-401',
    pathwayType: PathwayType.ARTICULATION,
    transferCredits: 2.5,
    equivalencyNotes: 'Credit towards business diploma electives',
    additionalRequirements: null,
    confidenceScore: 0.81,
    isAiSuggested: false,
    status: PathwayStatus.ACTIVE,
    isActive: true,
    approvedBy: 'Douglas College Business',
    approvedAt: new Date('2024-01-28'),
  },
];

export async function seedPathways() {
  console.log('Seeding pathways...');

  // Get all required data
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

  for (const pathwayData of pathwaysSeedData) {
    const {
      sourceInstitutionCode,
      targetInstitutionCode,
      microCredentialCode,
      ...pathwayFields
    } = pathwayData as any;

    const sourceInstitutionId = institutionMap.get(sourceInstitutionCode);
    const targetInstitutionId = institutionMap.get(targetInstitutionCode);
    const microCredentialId = credentialMap.get(microCredentialCode);

    if (!sourceInstitutionId) {
      console.warn(`Source institution ${sourceInstitutionCode} not found, skipping pathway`);
      continue;
    }

    if (!targetInstitutionId) {
      console.warn(`Target institution ${targetInstitutionCode} not found, skipping pathway`);
      continue;
    }

    if (!microCredentialId) {
      console.warn(`Micro-credential ${microCredentialCode} not found, skipping pathway`);
      continue;
    }

    // Create unique identifier for upsert
    const pathwayId = `${sourceInstitutionId}-${targetInstitutionId}-${microCredentialId}`;

    await prisma.pathway.upsert({
      where: { id: pathwayId },
      update: {
        ...pathwayFields,
        sourceInstitutionId,
        targetInstitutionId,
        microCredentialId,
      },
      create: {
        id: pathwayId,
        ...pathwayFields,
        sourceInstitutionId,
        targetInstitutionId,
        microCredentialId,
      },
    });
  }

  console.log(`✓ Seeded ${pathwaysSeedData.length} pathways`);
}

// Allow running this seed file independently
if (require.main === module) {
  seedPathways()
    .catch((e) => {
      console.error('Error seeding pathways:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
