import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Define event types for Prisma
type QueryEvent = {
  query: string;
  params: string;
  duration: number;
  target: string;
};

type ErrorEvent = {
  message: string;
  target: string;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// Log queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e: QueryEvent) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

prisma.$on('error', (e: ErrorEvent) => {
  logger.error('Prisma error:', e);
});

prisma.$on('warn', (e: ErrorEvent) => {
  logger.warn('Prisma warning:', e);
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
