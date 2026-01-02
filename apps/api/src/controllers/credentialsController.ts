import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import {
  createMicroCredentialSchema,
  updateMicroCredentialSchema,
  credentialFilterSchema,
} from '../utils/validation';
import { PaginatedResponse } from '../types';
import { Prisma } from '@prisma/client';

export const getAllCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = credentialFilterSchema.parse(req.query);
    const { page, limit, sortBy, sortOrder, status, institutionId, credentialType, level, search } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MicroCredentialWhereInput = {
      ...(status && { status }),
      ...(institutionId && { institutionId }),
      ...(credentialType && { credentialType }),
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { programCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.microCredential.count({ where });

    // Get paginated results
    const credentials = await prisma.microCredential.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        learningOutcomes: true,
        recognitions: {
          include: {
            recognizingInstitution: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    const response: PaginatedResponse<typeof credentials[0]> = {
      data: credentials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getCredentialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const credential = await prisma.microCredential.findUnique({
      where: { id },
      include: {
        institution: true,
        learningOutcomes: {
          orderBy: { orderIndex: 'asc' },
        },
        recognitions: {
          include: {
            recognizingInstitution: true,
          },
        },
        pathways: {
          include: {
            sourceInstitution: true,
            targetInstitution: true,
          },
        },
        prerequisites: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!credential) {
      throw new AppError('Micro-credential not found', 404);
    }

    res.json({ status: 'success', data: credential });
  } catch (error) {
    next(error);
  }
};

export const createCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createMicroCredentialSchema.parse(req.body);

    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: validatedData.institutionId },
    });

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    // Check if program code is unique
    const existingCredential = await prisma.microCredential.findUnique({
      where: { programCode: validatedData.programCode },
    });

    if (existingCredential) {
      throw new AppError('Program code already exists', 400);
    }

    const credential = await prisma.microCredential.create({
      data: {
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : undefined,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
      },
      include: {
        institution: true,
      },
    });

    res.status(201).json({ status: 'success', data: credential });
  } catch (error) {
    next(error);
  }
};

export const updateCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateMicroCredentialSchema.parse(req.body);

    // Check if credential exists
    const existingCredential = await prisma.microCredential.findUnique({
      where: { id },
    });

    if (!existingCredential) {
      throw new AppError('Micro-credential not found', 404);
    }

    // If program code is being updated, check uniqueness
    if (validatedData.programCode && validatedData.programCode !== existingCredential.programCode) {
      const duplicateCredential = await prisma.microCredential.findUnique({
        where: { programCode: validatedData.programCode },
      });

      if (duplicateCredential) {
        throw new AppError('Program code already exists', 400);
      }
    }

    const credential = await prisma.microCredential.update({
      where: { id },
      data: {
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : undefined,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
      },
      include: {
        institution: true,
        learningOutcomes: true,
        recognitions: true,
      },
    });

    res.json({ status: 'success', data: credential });
  } catch (error) {
    next(error);
  }
};

export const deleteCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const credential = await prisma.microCredential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new AppError('Micro-credential not found', 404);
    }

    await prisma.microCredential.delete({
      where: { id },
    });

    res.json({ status: 'success', message: 'Micro-credential deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const publishCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const credential = await prisma.microCredential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new AppError('Micro-credential not found', 404);
    }

    if (credential.status === 'PUBLISHED') {
      throw new AppError('Micro-credential is already published', 400);
    }

    const updatedCredential = await prisma.microCredential.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        institution: true,
      },
    });

    res.json({ status: 'success', data: updatedCredential });
  } catch (error) {
    next(error);
  }
};

export const archiveCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const credential = await prisma.microCredential.findUnique({
      where: { id },
    });

    if (!credential) {
      throw new AppError('Micro-credential not found', 404);
    }

    const updatedCredential = await prisma.microCredential.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isActive: false,
      },
      include: {
        institution: true,
      },
    });

    res.json({ status: 'success', data: updatedCredential });
  } catch (error) {
    next(error);
  }
};
