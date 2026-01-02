/**
 * Institutions Seed Data
 * 
 * Seeds BC post-secondary institutions and partners
 */

import { prisma } from '../utils/client';
import { InstitutionType } from '@prisma/client';

export const institutionsSeedData = [
  {
    name: 'British Columbia Institute of Technology',
    code: 'BCIT',
    type: InstitutionType.INSTITUTE,
    address: '3700 Willingdon Avenue',
    city: 'Burnaby',
    province: 'BC',
    postalCode: 'V5G 3H2',
    country: 'Canada',
    website: 'https://www.bcit.ca',
    contactEmail: 'info@bcit.ca',
    contactPhone: '604-434-5734',
    isActive: true,
  },
  {
    name: 'University of British Columbia',
    code: 'UBC',
    type: InstitutionType.UNIVERSITY,
    address: '2329 West Mall',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6T 1Z4',
    country: 'Canada',
    website: 'https://www.ubc.ca',
    contactEmail: 'info@ubc.ca',
    contactPhone: '604-822-2211',
    isActive: true,
  },
  {
    name: 'Douglas College',
    code: 'DOUGLAS',
    type: InstitutionType.COLLEGE,
    address: '700 Royal Avenue',
    city: 'New Westminster',
    province: 'BC',
    postalCode: 'V3L 5B2',
    country: 'Canada',
    website: 'https://www.douglascollege.ca',
    contactEmail: 'info@douglascollege.ca',
    contactPhone: '604-527-5400',
    isActive: true,
  },
  {
    name: 'Simon Fraser University',
    code: 'SFU',
    type: InstitutionType.UNIVERSITY,
    address: '8888 University Drive',
    city: 'Burnaby',
    province: 'BC',
    postalCode: 'V5A 1S6',
    country: 'Canada',
    website: 'https://www.sfu.ca',
    contactEmail: 'info@sfu.ca',
    contactPhone: '778-782-3111',
    isActive: true,
  },
  {
    name: 'Langara College',
    code: 'LANGARA',
    type: InstitutionType.COLLEGE,
    address: '100 West 49th Avenue',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V5Y 2Z6',
    country: 'Canada',
    website: 'https://www.langara.ca',
    contactEmail: 'info@langara.ca',
    contactPhone: '604-323-5511',
    isActive: true,
  },
];

export async function seedInstitutions() {
  console.log('Seeding institutions...');

  for (const institution of institutionsSeedData) {
    await prisma.institution.upsert({
      where: { code: institution.code },
      update: institution,
      create: institution,
    });
  }

  console.log(`✓ Seeded ${institutionsSeedData.length} institutions`);
}

// Allow running this seed file independently
if (require.main === module) {
  seedInstitutions()
    .catch((e) => {
      console.error('Error seeding institutions:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
