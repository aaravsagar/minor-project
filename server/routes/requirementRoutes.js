import { Router } from 'express';
import { authenticateBuyer } from '../middleware/authMiddleware.js';
import { requirementCreationRules, validateRequirement } from '../middleware/requirementValidator.js';
import { createRequirementHandler } from '../controllers/requirementController.js';

const router = Router();

/**
 * POST /api/requirements
 * Authenticates buyer, applies express-validator rules, halts invalid requests,
 * and creates requirement in Firestore.
 */
router.post(
  '/',
  authenticateBuyer,
  requirementCreationRules,
  validateRequirement,
  createRequirementHandler
);

export default router;
