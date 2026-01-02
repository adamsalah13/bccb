/**
 * Database Connection Management
 * 
 * Provides utilities for managing database connections, health checks,
 * and graceful shutdown.
 */

import { prisma } from './client';

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

/**
 * Connect to database
 */
export async function connect(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ Connected to database');
  } catch (error) {
    console.error('✗ Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnect(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✓ Disconnected from database');
  } catch (error) {
    console.error('✗ Error disconnecting from database:', error);
    throw error;
  }
}

/**
 * Check database health
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    try {
      await disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Reset database (WARNING: Deletes all data!)
 * Only allowed in development and test environments
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production environment');
  }

  // Additional safeguard: require explicit confirmation
  if (!process.env.ALLOW_DB_RESET) {
    throw new Error(
      'Database reset requires ALLOW_DB_RESET environment variable to be set. ' +
      'This is a safety measure to prevent accidental data loss.'
    );
  }

  console.log('⚠️  Resetting database...');

  try {
    // Delete all data in reverse order of dependencies
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.prerequisite.deleteMany();
    await prisma.pathway.deleteMany();
    await prisma.recognition.deleteMany();
    await prisma.learningOutcome.deleteMany();
    await prisma.microCredential.deleteMany();
    await prisma.institution.deleteMany();

    console.log('✓ Database reset complete');
  } catch (error) {
    console.error('✗ Error resetting database:', error);
    throw error;
  }
}
