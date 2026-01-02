import { Router } from 'express';
import {
  getAllRecognitions,
  getRecognitionById,
  createRecognition,
  updateRecognition,
  deleteRecognition,
  deactivateRecognition,
  activateRecognition,
  getRecognitionsByCredential,
  getRecognitionsByInstitution,
} from '../controllers/recognitionController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional authentication for enhanced data)
router.get('/', optionalAuth, getAllRecognitions);
router.get('/:id', optionalAuth, getRecognitionById);

// Get recognitions by credential or institution
router.get('/credential/:credentialId', optionalAuth, getRecognitionsByCredential);
router.get('/institution/:institutionId', optionalAuth, getRecognitionsByInstitution);

// Protected routes - require authentication
router.post('/', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), createRecognition);
router.put('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), updateRecognition);
router.delete('/:id', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), deleteRecognition);

// Recognition status management
router.post('/:id/deactivate', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), deactivateRecognition);
router.post('/:id/activate', authenticate, authorize('ADMIN', 'INSTITUTION_ADMIN'), activateRecognition);

export default router;
