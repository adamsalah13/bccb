import { Router } from 'express';
import {
  getAllPathways,
  getPathwayById,
  createPathway,
  updatePathway,
  deletePathway,
  approvePathway,
  activatePathway,
  suspendPathway,
  getAISuggestedPathways,
} from '../controllers/pathwaysController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional authentication for enhanced data)
router.get('/', optionalAuth, getAllPathways);
router.get('/:id', optionalAuth, getPathwayById);

// AI-suggested pathways
router.get('/suggested/:microCredentialId', optionalAuth, getAISuggestedPathways);

// Protected routes - require authentication
router.post('/', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN', 'PROGRAM_COORDINATOR'), createPathway);
router.put('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN', 'PROGRAM_COORDINATOR'), updatePathway);
router.delete('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), deletePathway);

// Pathway workflow routes
router.post('/:id/approve', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), approvePathway);
router.post('/:id/activate', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), activatePathway);
router.post('/:id/suspend', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), suspendPathway);

export default router;
