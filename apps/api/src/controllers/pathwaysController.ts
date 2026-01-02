import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import {
  createPathwaySchema,
  updatePathwaySchema,
  pathwayFilterSchema,
} from '../utils/validation';
import { PaginatedResponse } from '../types';
import { Prisma } from '@prisma/client';

export const getAllPathways = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = pathwayFilterSchema.parse(req.query);
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      sourceInstitutionId,
      targetInstitutionId,
      pathwayType,
      microCredentialId,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PathwayWhereInput = {
      ...(status && { status }),
      ...(sourceInstitutionId && { sourceInstitutionId }),
      ...(targetInstitutionId && { targetInstitutionId }),
      ...(pathwayType && { pathwayType }),
      ...(microCredentialId && { microCredentialId }),
    };

    // Get total count
    const total = await prisma.pathway.count({ where });

    // Get paginated results
    const pathways = await prisma.pathway.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
      include: {
        sourceInstitution: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        targetInstitution: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        microCredential: {
          select: {
            id: true,
            title: true,
            programCode: true,
            credentialType: true,
            status: true,
          },
        },
      },
    });

    const response: PaginatedResponse<typeof pathways[0]> = {
      data: pathways,
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

export const getPathwayById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: {
          include: {
            institution: true,
            learningOutcomes: true,
          },
        },
      },
    });

    if (!pathway) {
      throw new AppError('Pathway not found', 404);
    }

    res.json({ status: 'success', data: pathway });
  } catch (error) {
    next(error);
  }
};

export const createPathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createPathwaySchema.parse(req.body);

    // Validate institutions exist
    const [sourceInstitution, targetInstitution, microCredential] = await Promise.all([
      prisma.institution.findUnique({ where: { id: validatedData.sourceInstitutionId } }),
      prisma.institution.findUnique({ where: { id: validatedData.targetInstitutionId } }),
      prisma.microCredential.findUnique({ where: { id: validatedData.microCredentialId } }),
    ]);

    if (!sourceInstitution) {
      throw new AppError('Source institution not found', 404);
    }

    if (!targetInstitution) {
      throw new AppError('Target institution not found', 404);
    }

    if (!microCredential) {
      throw new AppError('Micro-credential not found', 404);
    }

    const pathway = await prisma.pathway.create({
      data: validatedData,
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.status(201).json({ status: 'success', data: pathway });
  } catch (error) {
    next(error);
  }
};

export const updatePathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updatePathwaySchema.parse(req.body);

    // Check if pathway exists
    const existingPathway = await prisma.pathway.findUnique({
      where: { id },
    });

    if (!existingPathway) {
      throw new AppError('Pathway not found', 404);
    }

    // Validate institutions if they are being updated
    if (validatedData.sourceInstitutionId) {
      const sourceInstitution = await prisma.institution.findUnique({
        where: { id: validatedData.sourceInstitutionId },
      });
      if (!sourceInstitution) {
        throw new AppError('Source institution not found', 404);
      }
    }

    if (validatedData.targetInstitutionId) {
      const targetInstitution = await prisma.institution.findUnique({
        where: { id: validatedData.targetInstitutionId },
      });
      if (!targetInstitution) {
        throw new AppError('Target institution not found', 404);
      }
    }

    if (validatedData.microCredentialId) {
      const microCredential = await prisma.microCredential.findUnique({
        where: { id: validatedData.microCredentialId },
      });
      if (!microCredential) {
        throw new AppError('Micro-credential not found', 404);
      }
    }

    const pathway = await prisma.pathway.update({
      where: { id },
      data: validatedData,
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.json({ status: 'success', data: pathway });
  } catch (error) {
    next(error);
  }
};

export const deletePathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
    });

    if (!pathway) {
      throw new AppError('Pathway not found', 404);
    }

    await prisma.pathway.delete({
      where: { id },
    });

    res.json({ status: 'success', message: 'Pathway deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approvePathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
    });

    if (!pathway) {
      throw new AppError('Pathway not found', 404);
    }

    if (pathway.status === 'APPROVED' || pathway.status === 'ACTIVE') {
      throw new AppError('Pathway is already approved', 400);
    }

    const updatedPathway = await prisma.pathway.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || req.user?.userId,
        approvedAt: new Date(),
      },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.json({ status: 'success', data: updatedPathway });
  } catch (error) {
    next(error);
  }
};

export const activatePathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
    });

    if (!pathway) {
      throw new AppError('Pathway not found', 404);
    }

    if (pathway.status !== 'APPROVED') {
      throw new AppError('Pathway must be approved before activation', 400);
    }

    const updatedPathway = await prisma.pathway.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.json({ status: 'success', data: updatedPathway });
  } catch (error) {
    next(error);
  }
};

export const suspendPathway = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pathway = await prisma.pathway.findUnique({
      where: { id },
    });

    if (!pathway) {
      throw new AppError('Pathway not found', 404);
    }

    const updatedPathway = await prisma.pathway.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        isActive: false,
      },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.json({ status: 'success', data: updatedPathway });
  } catch (error) {
    next(error);
  }
};

export const getAISuggestedPathways = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { microCredentialId } = req.params;

    // Get AI-suggested pathways for a micro-credential
    const pathways = await prisma.pathway.findMany({
      where: {
        microCredentialId,
        isAiSuggested: true,
      },
      orderBy: {
        confidenceScore: 'desc',
      },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
        microCredential: true,
      },
    });

    res.json({ status: 'success', data: pathways });
  } catch (error) {
    next(error);
  }
};
