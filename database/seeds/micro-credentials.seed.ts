/**
 * Micro-Credentials Seed Data
 * 
 * Seeds sample micro-credentials with realistic data
 */

import { prisma } from '../utils/client';
import {
  CredentialType,
  DeliveryMode,
  EducationLevel,
  CredentialStatus,
  BloomLevel,
  OutcomeCategory,
  PrerequisiteType,
} from '@prisma/client';

export const microCredentialsSeedData = [
  {
    title: 'Animal Cell Culture Techniques',
    shortTitle: 'Cell Culture',
    description: 'Develop fundamental skills in animal cell culture, including aseptic technique, cell line maintenance, cryopreservation, and quality control. This micro-credential provides hands-on experience with industry-standard protocols and equipment used in biopharmaceutical manufacturing and research.',
    programCode: 'BCIT-BIO-101',
    institutionCode: 'BCIT',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 120,
    credits: 4.0,
    assessmentMethod: 'Practical demonstrations, lab reports, and theoretical examination',
    cost: 2500,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    campus: 'Burnaby Campus',
    department: 'School of Health Sciences',
    faculty: 'Applied and Natural Sciences',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-01'),
    programUrl: 'https://www.bcit.ca/programs/cell-culture',
    learningOutcomes: [
      {
        outcomeText: 'Demonstrate proficiency in aseptic techniques for cell culture',
        bloomLevel: BloomLevel.APPLY,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.1, 0.2, 0.3, 0.4, 0.5],
        keywords: ['aseptic', 'cell culture', 'sterile technique'],
      },
      {
        outcomeText: 'Evaluate cell culture quality and identify contamination',
        bloomLevel: BloomLevel.EVALUATE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 2,
        isCore: true,
        embeddings: [0.2, 0.3, 0.4, 0.5, 0.6],
        keywords: ['quality control', 'contamination', 'evaluation'],
      },
    ],
    prerequisites: [
      {
        description: 'Basic microbiology or cell biology course',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Digital Marketing Fundamentals',
    shortTitle: 'Digital Marketing',
    description: 'Master the essentials of digital marketing including SEO, social media marketing, content strategy, and analytics. Learn to create effective digital campaigns and measure their success using industry-standard tools.',
    programCode: 'BCIT-MKT-201',
    institutionCode: 'BCIT',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 80,
    credits: 3.0,
    assessmentMethod: 'Projects, case studies, and online quizzes',
    cost: 1800,
    language: 'English',
    level: EducationLevel.INTRODUCTORY,
    department: 'School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-15'),
    programUrl: 'https://www.bcit.ca/programs/digital-marketing',
    learningOutcomes: [
      {
        outcomeText: 'Create comprehensive digital marketing strategies',
        bloomLevel: BloomLevel.CREATE,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.3, 0.4, 0.5, 0.6, 0.7],
        keywords: ['digital marketing', 'strategy', 'planning'],
      },
    ],
    prerequisites: [],
  },
  {
    title: 'Data Analytics with Python',
    shortTitle: 'Python Analytics',
    description: 'Learn to analyze and visualize data using Python. Cover pandas, NumPy, matplotlib, and scikit-learn for data manipulation, statistical analysis, and basic machine learning.',
    programCode: 'BCIT-CST-301',
    institutionCode: 'BCIT',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 100,
    credits: 3.5,
    assessmentMethod: 'Programming assignments and data analysis projects',
    cost: 2200,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'School of Computing and Academic Studies',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-02-01'),
    programUrl: 'https://www.bcit.ca/programs/python-analytics',
    learningOutcomes: [
      {
        outcomeText: 'Apply Python libraries for data analysis and visualization',
        bloomLevel: BloomLevel.APPLY,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.4, 0.5, 0.6, 0.7, 0.8],
        keywords: ['python', 'data analysis', 'visualization'],
      },
    ],
    prerequisites: [
      {
        description: 'Basic programming experience (any language)',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Project Management Professional Essentials',
    shortTitle: 'PM Essentials',
    description: 'Develop core project management competencies including planning, execution, monitoring, and closing projects. Aligned with PMI standards and prepares students for PMP certification.',
    programCode: 'BCIT-MGT-401',
    institutionCode: 'BCIT',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 90,
    credits: 3.0,
    assessmentMethod: 'Case studies, project plan development, and examination',
    cost: 2000,
    language: 'English',
    level: EducationLevel.ADVANCED,
    department: 'School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-20'),
    programUrl: 'https://www.bcit.ca/programs/project-management',
    learningOutcomes: [
      {
        outcomeText: 'Develop comprehensive project management plans',
        bloomLevel: BloomLevel.CREATE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.5, 0.6, 0.7, 0.8, 0.9],
        keywords: ['project management', 'planning', 'execution'],
      },
    ],
    prerequisites: [
      {
        description: 'Minimum 2 years work experience',
        type: PrerequisiteType.WORK_EXPERIENCE,
        isMandatory: false,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Web Development Fundamentals',
    shortTitle: 'Web Dev',
    description: 'Learn modern web development with HTML5, CSS3, JavaScript, and responsive design principles. Build interactive, mobile-friendly websites using current best practices.',
    programCode: 'DOUGLAS-WEB-101',
    institutionCode: 'DOUGLAS',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 60,
    credits: 2.0,
    assessmentMethod: 'Website projects and code reviews',
    cost: 1500,
    language: 'English',
    level: EducationLevel.INTRODUCTORY,
    department: 'Computer Science',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-02-15'),
    programUrl: 'https://www.douglascollege.ca/programs/web-dev',
    learningOutcomes: [
      {
        outcomeText: 'Create responsive websites using HTML, CSS, and JavaScript',
        bloomLevel: BloomLevel.CREATE,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.6, 0.7, 0.8, 0.9, 1.0],
        keywords: ['web development', 'HTML', 'CSS', 'JavaScript'],
      },
    ],
    prerequisites: [],
  },
  {
    title: 'Cloud Computing Essentials',
    shortTitle: 'Cloud Essentials',
    description: 'Introduction to cloud computing concepts, services, and deployment models. Hands-on experience with AWS, Azure, and Google Cloud Platform.',
    programCode: 'BCIT-CST-501',
    institutionCode: 'BCIT',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 75,
    credits: 2.5,
    assessmentMethod: 'Labs, quizzes, and cloud deployment project',
    cost: 1900,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'School of Computing and Academic Studies',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-03-01'),
    programUrl: 'https://www.bcit.ca/programs/cloud-computing',
    learningOutcomes: [
      {
        outcomeText: 'Deploy and manage cloud-based applications',
        bloomLevel: BloomLevel.APPLY,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.7, 0.8, 0.9, 1.0, 0.9],
        keywords: ['cloud computing', 'deployment', 'AWS', 'Azure'],
      },
    ],
    prerequisites: [
      {
        description: 'Basic understanding of networking and operating systems',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Business Analytics and Intelligence',
    shortTitle: 'Business Analytics',
    description: 'Learn to transform data into actionable business insights. Cover data warehousing, ETL processes, dashboard creation, and predictive analytics.',
    programCode: 'SFU-BUS-201',
    institutionCode: 'SFU',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 110,
    credits: 4.0,
    assessmentMethod: 'Analytics projects, presentations, and examinations',
    cost: 2800,
    language: 'English',
    level: EducationLevel.ADVANCED,
    department: 'Beedie School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-10'),
    programUrl: 'https://www.sfu.ca/programs/business-analytics',
    learningOutcomes: [
      {
        outcomeText: 'Analyze business data to generate strategic insights',
        bloomLevel: BloomLevel.ANALYZE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.8, 0.9, 1.0, 0.9, 0.8],
        keywords: ['business analytics', 'data analysis', 'insights'],
      },
    ],
    prerequisites: [
      {
        description: 'Undergraduate degree or equivalent experience',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Cybersecurity Fundamentals',
    shortTitle: 'Cybersecurity',
    description: 'Essential cybersecurity concepts including threat identification, risk assessment, security controls, and incident response. Aligned with industry certifications.',
    programCode: 'BCIT-CST-601',
    institutionCode: 'BCIT',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 85,
    credits: 3.0,
    assessmentMethod: 'Security assessments, labs, and case studies',
    cost: 2100,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'School of Computing and Academic Studies',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-02-20'),
    programUrl: 'https://www.bcit.ca/programs/cybersecurity',
    learningOutcomes: [
      {
        outcomeText: 'Evaluate security risks and recommend appropriate controls',
        bloomLevel: BloomLevel.EVALUATE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.9, 1.0, 0.9, 0.8, 0.7],
        keywords: ['cybersecurity', 'risk assessment', 'security controls'],
      },
    ],
    prerequisites: [
      {
        description: 'IT fundamentals or equivalent experience',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'UX/UI Design Principles',
    shortTitle: 'UX/UI Design',
    description: 'Master user experience and interface design principles. Learn design thinking, prototyping, user research, and usability testing using industry-standard tools.',
    programCode: 'LANGARA-DES-101',
    institutionCode: 'LANGARA',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 70,
    credits: 2.5,
    assessmentMethod: 'Design projects, portfolio development, and peer reviews',
    cost: 1700,
    language: 'English',
    level: EducationLevel.INTRODUCTORY,
    department: 'Design and Visual Communications',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-03-10'),
    programUrl: 'https://www.langara.ca/programs/ux-ui-design',
    learningOutcomes: [
      {
        outcomeText: 'Create user-centered design solutions for digital products',
        bloomLevel: BloomLevel.CREATE,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [1.0, 0.9, 0.8, 0.7, 0.6],
        keywords: ['UX design', 'UI design', 'user research', 'prototyping'],
      },
    ],
    prerequisites: [],
  },
  {
    title: 'Sustainable Business Practices',
    shortTitle: 'Sustainability',
    description: 'Explore sustainability in business context. Learn environmental management, corporate social responsibility, and sustainable supply chain practices.',
    programCode: 'UBC-BUS-301',
    institutionCode: 'UBC',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 95,
    credits: 3.5,
    assessmentMethod: 'Research projects, case analyses, and presentations',
    cost: 2600,
    language: 'English',
    level: EducationLevel.ADVANCED,
    department: 'Sauder School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-05'),
    programUrl: 'https://www.ubc.ca/programs/sustainability',
    learningOutcomes: [
      {
        outcomeText: 'Analyze business operations through sustainability lens',
        bloomLevel: BloomLevel.ANALYZE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.9, 0.8, 0.7, 0.6, 0.5],
        keywords: ['sustainability', 'business practices', 'CSR'],
      },
    ],
    prerequisites: [
      {
        description: 'Business fundamentals or work experience',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: false,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Machine Learning Foundations',
    shortTitle: 'ML Foundations',
    description: 'Introduction to machine learning algorithms, model training, evaluation, and deployment. Practical experience with scikit-learn, TensorFlow, and real-world datasets.',
    programCode: 'SFU-CST-401',
    institutionCode: 'SFU',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 105,
    credits: 4.0,
    assessmentMethod: 'ML projects, code reviews, and model evaluation reports',
    cost: 2400,
    language: 'English',
    level: EducationLevel.ADVANCED,
    department: 'School of Computing Science',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-02-05'),
    programUrl: 'https://www.sfu.ca/programs/machine-learning',
    learningOutcomes: [
      {
        outcomeText: 'Implement and evaluate machine learning models',
        bloomLevel: BloomLevel.APPLY,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.8, 0.7, 0.6, 0.5, 0.4],
        keywords: ['machine learning', 'algorithms', 'model training'],
      },
    ],
    prerequisites: [
      {
        description: 'Programming experience and statistics knowledge',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Supply Chain Management Fundamentals',
    shortTitle: 'Supply Chain',
    description: 'Comprehensive introduction to supply chain management including procurement, logistics, inventory management, and supplier relationships.',
    programCode: 'DOUGLAS-BUS-201',
    institutionCode: 'DOUGLAS',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 80,
    credits: 3.0,
    assessmentMethod: 'Case studies, supply chain simulation, and examinations',
    cost: 1900,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-03-15'),
    programUrl: 'https://www.douglascollege.ca/programs/supply-chain',
    learningOutcomes: [
      {
        outcomeText: 'Analyze and optimize supply chain operations',
        bloomLevel: BloomLevel.ANALYZE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.7, 0.6, 0.5, 0.4, 0.3],
        keywords: ['supply chain', 'logistics', 'operations'],
      },
    ],
    prerequisites: [],
  },
  {
    title: 'Indigenous Business and Entrepreneurship',
    shortTitle: 'Indigenous Business',
    description: 'Explore Indigenous approaches to business and entrepreneurship. Learn about Indigenous economic development, cultural considerations, and successful Indigenous business models.',
    programCode: 'LANGARA-BUS-401',
    institutionCode: 'LANGARA',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 65,
    credits: 2.5,
    assessmentMethod: 'Business plans, community engagement projects, and presentations',
    cost: 1600,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'School of Business',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-01-25'),
    programUrl: 'https://www.langara.ca/programs/indigenous-business',
    learningOutcomes: [
      {
        outcomeText: 'Apply Indigenous perspectives to business development',
        bloomLevel: BloomLevel.APPLY,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.6, 0.5, 0.4, 0.3, 0.2],
        keywords: ['Indigenous business', 'entrepreneurship', 'economic development'],
      },
    ],
    prerequisites: [],
  },
  {
    title: 'Health Informatics Essentials',
    shortTitle: 'Health Informatics',
    description: 'Introduction to health informatics including electronic health records, health data analytics, privacy and security, and clinical decision support systems.',
    programCode: 'UBC-HLT-201',
    institutionCode: 'UBC',
    credentialType: CredentialType.MICRO_CREDENTIAL,
    deliveryMode: DeliveryMode.ONLINE,
    duration: 90,
    credits: 3.0,
    assessmentMethod: 'Projects, case studies, and data analysis assignments',
    cost: 2300,
    language: 'English',
    level: EducationLevel.INTERMEDIATE,
    department: 'Faculty of Medicine',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-02-10'),
    programUrl: 'https://www.ubc.ca/programs/health-informatics',
    learningOutcomes: [
      {
        outcomeText: 'Evaluate health information systems and their applications',
        bloomLevel: BloomLevel.EVALUATE,
        category: OutcomeCategory.COMPETENCIES,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.5, 0.4, 0.3, 0.2, 0.1],
        keywords: ['health informatics', 'EHR', 'health data'],
      },
    ],
    prerequisites: [
      {
        description: 'Healthcare or IT background',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: false,
        orderIndex: 1,
      },
    ],
  },
  {
    title: 'Renewable Energy Systems',
    shortTitle: 'Renewable Energy',
    description: 'Comprehensive study of renewable energy technologies including solar, wind, hydro, and biomass. Learn system design, economic analysis, and environmental impact.',
    programCode: 'BCIT-ENG-501',
    institutionCode: 'BCIT',
    credentialType: CredentialType.CERTIFICATE,
    deliveryMode: DeliveryMode.HYBRID,
    duration: 115,
    credits: 4.5,
    assessmentMethod: 'Technical projects, system design, and presentations',
    cost: 2900,
    language: 'English',
    level: EducationLevel.ADVANCED,
    department: 'School of Energy',
    status: CredentialStatus.PUBLISHED,
    isActive: true,
    effectiveDate: new Date('2024-03-05'),
    programUrl: 'https://www.bcit.ca/programs/renewable-energy',
    learningOutcomes: [
      {
        outcomeText: 'Design renewable energy systems for specific applications',
        bloomLevel: BloomLevel.CREATE,
        category: OutcomeCategory.SKILLS,
        orderIndex: 1,
        isCore: true,
        embeddings: [0.4, 0.3, 0.2, 0.1, 0.2],
        keywords: ['renewable energy', 'system design', 'sustainability'],
      },
    ],
    prerequisites: [
      {
        description: 'Engineering fundamentals or related technical background',
        type: PrerequisiteType.ACADEMIC,
        isMandatory: true,
        orderIndex: 1,
      },
    ],
  },
];

export async function seedMicroCredentials() {
  console.log('Seeding micro-credentials...');

  // Get institution IDs
  const institutions = await prisma.institution.findMany({
    select: { id: true, code: true },
  });

  const institutionMap = new Map(
    institutions.map((inst) => [inst.code, inst.id])
  );

  for (const credentialData of microCredentialsSeedData) {
    const {
      institutionCode,
      learningOutcomes,
      prerequisites,
      ...credentialFields
    } = credentialData as any;

    const institutionId = institutionMap.get(institutionCode);
    if (!institutionId) {
      console.warn(`Institution ${institutionCode} not found, skipping credential`);
      continue;
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      const credential = await tx.microCredential.upsert({
        where: { programCode: credentialFields.programCode },
        update: {
          ...credentialFields,
          institutionId,
        },
        create: {
          ...credentialFields,
          institutionId,
        },
      });

      // Delete existing related records to avoid duplicates
      await tx.learningOutcome.deleteMany({
        where: { microCredentialId: credential.id },
      });
      await tx.prerequisite.deleteMany({
        where: { microCredentialId: credential.id },
      });

      // Create learning outcomes
      if (learningOutcomes && learningOutcomes.length > 0) {
        await tx.learningOutcome.createMany({
          data: learningOutcomes.map((outcome: any) => ({
            ...outcome,
            microCredentialId: credential.id,
          })),
        });
      }

      // Create prerequisites
      if (prerequisites && prerequisites.length > 0) {
        await tx.prerequisite.createMany({
          data: prerequisites.map((prereq: any) => ({
            ...prereq,
            microCredentialId: credential.id,
          })),
        });
      }
    });
  }

  console.log(`✓ Seeded ${microCredentialsSeedData.length} micro-credentials`);
}

// Allow running this seed file independently
if (require.main === module) {
  seedMicroCredentials()
    .catch((e) => {
      console.error('Error seeding micro-credentials:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
