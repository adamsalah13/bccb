import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import {
  createRecognitionSchema,
  updateRecognitionSchema,
  recognitionFilterSchema,
} from '../utils/validation';
import { PaginatedResponse } from '../types';
import { Prisma } from '@prisma/client';

export const getAllRecognitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = recognitionFilterSchema.parse(req.query);
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      microCredentialId,
      recognizingInstitutionId,
      recognitionType,
      isActive,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.RecognitionWhereInput = {
      ...(microCredentialId && { microCredentialId }),
      ...(recognizingInstitutionId && { recognizingInstitutionId }),
      ...(recognitionType && { recognitionType }),
      ...(isActive !== undefined && { isActive }),
    };

    // Get total count
    const total = await prisma.recognition.count({ where });

    // Get paginated results
    const recognitions = await prisma.recognition.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: sortOrder },
      include: {
        microCredential: {
          select: {
            id: true,
            title: true,
            programCode: true,
            institutionId: true,
            institution: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        recognizingInstitution: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
    });

    const response: PaginatedResponse<typeof recognitions[0]> = {
      data: recognitions,
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

export const getRecognitionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recognition = await prisma.recognition.findUnique({
      where: { id },
      include: {
        microCredential: {
          include: {
            institution: true,
            learningOutcomes: true,
          },
        },
        recognizingInstitution: true,
      },
    });

    if (!recognition) {
      throw new AppError('Recognition not found', 404);
    }

    res.json({ status: 'success', data: recognition });
  } catch (error) {
    next(error);
  }
};

export const createRecognition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createRecognitionSchema.parse(req.body);

    // Validate micro-credential and institution exist
    const [microCredential, institution] = await Promise.all([
      prisma.microCredential.findUnique({ where: { id: validatedData.microCredentialId } }),
      prisma.institution.findUnique({ where: { id: validatedData.recognizingInstitutionId } }),
    ]);

    if (!microCredential) {
      throw new AppError('Micro-credential not found', 404);
    }

    if (!institution) {
      throw new AppError('Recognizing institution not found', 404);
    }

    // Check if micro-credential is published
    if (microCredential.status !== 'PUBLISHED') {
      throw new AppError('Micro-credential must be published to receive recognition', 400);
    }

    const recognition = await prisma.recognition.create({
      data: {
        ...validatedData,
        effectiveDate: new Date(validatedData.effectiveDate),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
      },
      include: {
        microCredential: true,
        recognizingInstitution: true,
      },
    });

    res.status(201).json({ status: 'success', data: recognition });
  } catch (error) {
    next(error);
  }
};

export const updateRecognition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateRecognitionSchema.parse(req.body);

    // Check if recognition exists
    const existingRecognition = await prisma.recognition.findUnique({
      where: { id },
    });

    if (!existingRecognition) {
      throw new AppError('Recognition not found', 404);
    }

    // Validate institutions if they are being updated
    if (validatedData.microCredentialId) {
      const microCredential = await prisma.microCredential.findUnique({
        where: { id: validatedData.microCredentialId },
      });
      if (!microCredential) {
        throw new AppError('Micro-credential not found', 404);
      }
    }

    if (validatedData.recognizingInstitutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: validatedData.recognizingInstitutionId },
      });
      if (!institution) {
        throw new AppError('Recognizing institution not found', 404);
      }
    }

    const recognition = await prisma.recognition.update({
      where: { id },
      data: {
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : undefined,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
      },
      include: {
        microCredential: true,
        recognizingInstitution: true,
      },
    });

    res.json({ status: 'success', data: recognition });
  } catch (error) {
    next(error);
  }
};

export const deleteRecognition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recognition = await prisma.recognition.findUnique({
      where: { id },
    });

    if (!recognition) {
      throw new AppError('Recognition not found', 404);
    }

    await prisma.recognition.delete({
      where: { id },
    });

    res.json({ status: 'success', message: 'Recognition deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateRecognition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recognition = await prisma.recognition.findUnique({
      where: { id },
    });

    if (!recognition) {
      throw new AppError('Recognition not found', 404);
    }

    const updatedRecognition = await prisma.recognition.update({
      where: { id },
      data: {
        isActive: false,
      },
      include: {
        microCredential: true,
        recognizingInstitution: true,
      },
    });

    res.json({ status: 'success', data: updatedRecognition });
  } catch (error) {
    next(error);
  }
};

export const activateRecognition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recognition = await prisma.recognition.findUnique({
      where: { id },
    });

    if (!recognition) {
      throw new AppError('Recognition not found', 404);
    }

    const updatedRecognition = await prisma.recognition.update({
      where: { id },
      data: {
        isActive: true,
      },
      include: {
        microCredential: true,
        recognizingInstitution: true,
      },
    });

    res.json({ status: 'success', data: updatedRecognition });
  } catch (error) {
    next(error);
  }
};

export const getRecognitionsByCredential = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credentialId } = req.params;

    // Check if credential exists
    const credential = await prisma.microCredential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      throw new AppError('Micro-credential not found', 404);
    }

    const recognitions = await prisma.recognition.findMany({
      where: {
        microCredentialId: credentialId,
        isActive: true,
      },
      include: {
        recognizingInstitution: true,
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    res.json({ status: 'success', data: recognitions });
  } catch (error) {
    next(error);
  }
};

export const getRecognitionsByInstitution = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { institutionId } = req.params;

    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new AppError('Institution not found', 404);
    }

    const recognitions = await prisma.recognition.findMany({
      where: {
        recognizingInstitutionId: institutionId,
        isActive: true,
      },
      include: {
        microCredential: {
          include: {
            institution: true,
          },
        },
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });

    res.json({ status: 'success', data: recognitions });
  } catch (error) {
    next(error);
  }
};
