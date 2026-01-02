/**
 * Users Seed Data
 * 
 * Seeds sample users with different roles
 * WARNING: Only runs in non-production environments
 */

import { prisma } from '../utils/client';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const usersSeedData = [
  {
    email: 'admin@bccb.ca',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Administrator',
    role: UserRole.ADMIN,
    institutionId: null,
    isActive: true,
  },
  {
    email: 'bcit.admin@bcit.ca',
    password: 'BcitAdmin123!',
    firstName: 'John',
    lastName: 'Smith',
    role: UserRole.INSTITUTION_ADMIN,
    institutionCode: 'BCIT',
    isActive: true,
  },
  {
    email: 'coordinator@bcit.ca',
    password: 'Coordinator123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.PROGRAM_COORDINATOR,
    institutionCode: 'BCIT',
    isActive: true,
  },
  {
    email: 'ubc.admin@ubc.ca',
    password: 'UbcAdmin123!',
    firstName: 'Michael',
    lastName: 'Chen',
    role: UserRole.INSTITUTION_ADMIN,
    institutionCode: 'UBC',
    isActive: true,
  },
  {
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.USER,
    institutionId: null,
    isActive: true,
  },
];

export async function seedUsers() {
  // Only seed users in non-production environments
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Skipping user seeds in production environment');
    return;
  }

  console.log('Seeding users...');

  // Get institution IDs for users that need them
  const institutions = await prisma.institution.findMany({
    where: {
      code: {
        in: ['BCIT', 'UBC'],
      },
    },
    select: {
      id: true,
      code: true,
    },
  });

  const institutionMap = new Map(
    institutions.map((inst) => [inst.code, inst.id])
  );

  for (const userData of usersSeedData) {
    const { password, institutionCode, ...rest } = userData as any;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const institutionId = institutionCode
      ? institutionMap.get(institutionCode)
      : rest.institutionId;

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        ...rest,
        passwordHash,
        institutionId,
      },
      create: {
        ...rest,
        passwordHash,
        institutionId,
      },
    });
  }

  console.log(`✓ Seeded ${usersSeedData.length} users`);
  console.log('\nTest User Credentials:');
  console.log('Admin: admin@bccb.ca / Admin123!');
  console.log('BCIT Admin: bcit.admin@bcit.ca / BcitAdmin123!');
  console.log('Coordinator: coordinator@bcit.ca / Coordinator123!');
  console.log('UBC Admin: ubc.admin@ubc.ca / UbcAdmin123!');
  console.log('User: user@example.com / User123!');
}

// Allow running this seed file independently
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error('Error seeding users:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
