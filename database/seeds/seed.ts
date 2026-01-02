/**
 * Main Seed Orchestrator
 * 
 * Runs all seed scripts in the correct order
 */

import { prisma } from '../utils/client';
import { testConnection } from '../utils/connection';
import { seedInstitutions } from './institutions.seed';
import { seedMicroCredentials } from './micro-credentials.seed';
import { seedRecognitions } from './recognitions.seed';
import { seedPathways } from './pathways.seed';
import { seedUsers } from './users.seed';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Test database connection
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    console.log('');

    // Run seeds in order of dependencies
    await seedInstitutions();
    console.log('');

    await seedMicroCredentials();
    console.log('');

    await seedRecognitions();
    console.log('');

    await seedPathways();
    console.log('');

    await seedUsers();
    console.log('');

    console.log('✅ All seeds completed successfully!');
    
    // Print summary
    console.log('\n📊 Database Summary:');
    const [
      institutionsCount,
      credentialsCount,
      recognitionsCount,
      pathwaysCount,
      usersCount,
    ] = await Promise.all([
      prisma.institution.count(),
      prisma.microCredential.count(),
      prisma.recognition.count(),
      prisma.pathway.count(),
      prisma.user.count(),
    ]);

    console.log(`  - Institutions: ${institutionsCount}`);
    console.log(`  - Micro-Credentials: ${credentialsCount}`);
    console.log(`  - Recognitions: ${recognitionsCount}`);
    console.log(`  - Pathways: ${pathwaysCount}`);
    console.log(`  - Users: ${usersCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seeds
seed()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
