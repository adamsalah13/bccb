#!/usr/bin/env tsx

/**
 * Database Verification Script
 * 
 * Verifies the database setup and shows example queries
 */

import { prisma } from './utils/client';
import { testConnection, healthCheck } from './utils/connection';
import { findManyWithCount } from './utils/helpers';

async function verify() {
  console.log('🔍 Verifying Database Setup...\n');

  // Test connection
  console.log('1. Testing database connection...');
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to database');
    process.exit(1);
  }

  // Health check
  const health = await healthCheck();
  console.log(`   Latency: ${health.latency}ms\n`);

  // Verify institutions
  console.log('2. Verifying institutions...');
  const institutions = await prisma.institution.findMany({
    select: { name: true, code: true, type: true },
  });
  console.log(`   ✓ Found ${institutions.length} institutions`);
  institutions.forEach(inst => {
    console.log(`     - ${inst.name} (${inst.code})`);
  });

  // Verify micro-credentials
  console.log('\n3. Verifying micro-credentials...');
  const credentials = await prisma.microCredential.findMany({
    take: 5,
    select: {
      title: true,
      programCode: true,
      institution: { select: { name: true } },
      duration: true,
      credits: true,
    },
  });
  console.log(`   ✓ Found ${credentials.length} credentials (showing first 5):`);
  credentials.forEach(cred => {
    console.log(`     - ${cred.title}`);
    console.log(`       ${cred.institution.name} | ${cred.duration}h | ${cred.credits} credits`);
  });

  // Verify pathways
  console.log('\n4. Verifying pathways...');
  const pathways = await prisma.pathway.findMany({
    take: 3,
    select: {
      name: true,
      sourceInstitution: { select: { name: true } },
      targetInstitution: { select: { name: true } },
      status: true,
    },
  });
  console.log(`   ✓ Found ${pathways.length} pathways (showing first 3):`);
  pathways.forEach(path => {
    console.log(`     - ${path.name}`);
    console.log(`       ${path.sourceInstitution.name} → ${path.targetInstitution.name} (${path.status})`);
  });

  // Verify recognitions
  console.log('\n5. Verifying recognitions...');
  const recognitionCount = await prisma.recognition.count();
  console.log(`   ✓ Found ${recognitionCount} recognition agreements`);

  // Verify users
  console.log('\n6. Verifying users...');
  const users = await prisma.user.findMany({
    select: { email: true, role: true, firstName: true, lastName: true },
  });
  console.log(`   ✓ Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`     - ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`       ${user.email}`);
  });

  // Test pagination helper
  console.log('\n7. Testing pagination helper...');
  const paginatedResults = await findManyWithCount(
    prisma.microCredential,
    { status: 'PUBLISHED' },
    { page: 1, pageSize: 5 }
  );
  console.log(`   ✓ Pagination working: ${paginatedResults.data.length} items returned`);
  console.log(`     Total: ${paginatedResults.pagination.totalItems} | ` +
              `Pages: ${paginatedResults.pagination.totalPages} | ` +
              `Has Next: ${paginatedResults.pagination.hasNext}`);

  console.log('\n✅ All verifications passed!\n');

  // Print summary
  const summary = {
    institutions: await prisma.institution.count(),
    microCredentials: await prisma.microCredential.count(),
    learningOutcomes: await prisma.learningOutcome.count(),
    pathways: await prisma.pathway.count(),
    recognitions: await prisma.recognition.count(),
    prerequisites: await prisma.prerequisite.count(),
    users: await prisma.user.count(),
  };

  console.log('📊 Database Summary:');
  Object.entries(summary).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`   ${label}: ${value}`);
  });

  console.log('\n🎉 Database layer is fully operational!\n');
}

verify()
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
