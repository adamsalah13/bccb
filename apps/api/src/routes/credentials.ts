import { Router } from 'express';
import {
  getAllCredentials,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
  publishCredential,
  archiveCredential,
} from '../controllers/credentialsController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional authentication for enhanced data)
router.get('/', optionalAuth, getAllCredentials);
router.get('/:id', optionalAuth, getCredentialById);

// Protected routes - require authentication
router.post('/', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN', 'PROGRAM_COORDINATOR'), createCredential);
router.put('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN', 'PROGRAM_COORDINATOR'), updateCredential);
router.delete('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), deleteCredential);

// Status management routes
router.post('/:id/publish', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), publishCredential);
router.post('/:id/archive', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), archiveCredential);

export default router;
