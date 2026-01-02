/**
 * Common Query Helpers
 * 
 * Provides reusable helper functions for common database operations.
 */

import { Prisma } from '@prisma/client';
import { prisma } from './client';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Create pagination parameters
 */
export function createPagination(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
  const skip = (page - 1) * pageSize;

  return {
    skip,
    take: pageSize,
    page,
    pageSize,
  };
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Get paginated results with count
 */
export async function findManyWithCount<T>(
  model: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  where: Record<string, any> = {},
  options: PaginationOptions & { orderBy?: Record<string, any> } = {}
): Promise<PaginatedResult<T>> {
  const { skip, take, page, pageSize } = createPagination(options);

  const [data, totalItems] = await Promise.all([
    model.findMany({
      where,
      skip,
      take,
      orderBy: options.orderBy,
    }),
    model.count({ where }),
  ]);

  return createPaginatedResult(data, totalItems, page, pageSize);
}

/**
 * Upsert helper with better error handling
 */
export async function safeUpsert<T>(
  model: {
    upsert: (args: any) => Promise<T>;
    findUnique: (args: any) => Promise<T | null>;
  },
  where: Record<string, any>,
  create: Record<string, any>,
  update: Record<string, any> = create
): Promise<T> {
  try {
    return await model.upsert({
      where,
      create,
      update,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        console.warn(`Unique constraint violation on ${JSON.stringify(where)}`);
        // Try to find existing record
        return await model.findUnique({ where });
      }
    }
    throw error;
  }
}

/**
 * Batch create with transaction
 */
export async function batchCreate<T>(
  model: {
    createMany: (args: any) => Promise<{ count: number }>;
  },
  data: Record<string, any>[],
  options: { skipDuplicates?: boolean } = {}
): Promise<{ count: number }> {
  return await model.createMany({
    data,
    skipDuplicates: options.skipDuplicates ?? true,
  });
}

/**
 * Search helper for full-text search
 */
export function createSearchQuery(
  searchTerm: string,
  fields: string[]
): Record<string, any> {
  if (!searchTerm) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Date range query helper
 */
export function createDateRangeQuery(
  field: string,
  from?: Date | string,
  to?: Date | string
): Record<string, any> {
  const query: Record<string, any> = {};

  if (from) {
    query[field] = { gte: new Date(from) };
  }

  if (to) {
    if (query[field]) {
      query[field].lte = new Date(to);
    } else {
      query[field] = { lte: new Date(to) };
    }
  }

  return query;
}

/**
 * Execute operations in transaction
 */
export async function executeInTransaction<T>(
  operations: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(operations);
}

/**
 * Soft delete helper (sets isActive to false)
 */
export async function softDelete(
  model: {
    update: (args: any) => Promise<any>;
  },
  where: Record<string, any>
): Promise<void> {
  await model.update({
    where,
    data: { isActive: false },
  });
}

/**
 * Bulk soft delete
 */
export async function bulkSoftDelete(
  model: {
    updateMany: (args: any) => Promise<{ count: number }>;
  },
  where: Record<string, any>
): Promise<{ count: number }> {
  return await model.updateMany({
    where,
    data: { isActive: false },
  });
}

/**
 * Get record by ID with error handling
 */
export async function findByIdOrThrow<T>(
  model: {
    findUnique: (args: any) => Promise<T | null>;
  },
  id: string,
  include?: Record<string, any>
): Promise<T> {
  const record = await model.findUnique({
    where: { id },
    include,
  });

  if (!record) {
    throw new Error(`Record with id ${id} not found`);
  }

  return record;
}

/**
 * Check if record exists
 */
export async function exists(
  model: {
    count: (args: any) => Promise<number>;
  },
  where: Record<string, any>
): Promise<boolean> {
  const count = await model.count({ where });
  return count > 0;
}
