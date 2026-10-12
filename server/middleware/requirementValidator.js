import { body, validationResult } from 'express-validator';
import { getCategoryLimits, CATEGORY_PRICE_LIMITS } from '../config/categoryPriceLimits.js';

/**
 * Reusable express-validator rules for requirement creation.
 */
export const requirementCreationRules = [
  // 1. Title validation
  body('title')
    .exists({ checkFalsy: true }).withMessage('Requirement title is required')
    .bail()
    .isString().withMessage('Title must be a text string')
    .bail()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  // 2. Description validation
  body('description')
    .exists({ checkFalsy: true }).withMessage('Requirement description is required')
    .bail()
    .isString().withMessage('Description must be a text string')
    .bail()
    .trim()
    .isLength({ min: 5, max: 2000 }).withMessage('Description must be between 5 and 2000 characters'),

  // 3. Category validation
  body('categoryId')
    .exists({ checkFalsy: true }).withMessage('Category is required')
    .bail()
    .isString().withMessage('Category must be a valid category identifier')
    .bail()
    .trim()
    .custom((catId) => {
      const limits = getCategoryLimits(catId);
      if (!CATEGORY_PRICE_LIMITS[catId] && limits === CATEGORY_PRICE_LIMITS.default && !catId.startsWith('cat_')) {
        throw new Error('Unsupported category. Please select a valid platform category.');
      }
      return true;
    }),

  // 4. Budget / Expected Price validation
  body('budget')
    .exists({ checkNull: true }).withMessage('Budget is required')
    .bail()
    .custom((val) => {
      if (val === '' || val === null || val === undefined) {
        throw new Error('Budget is required');
      }
      // Check numeric, finite, non-NaN, non-Infinity
      const num = Number(val);
      if (typeof val === 'boolean' || isNaN(num) || !Number.isFinite(num)) {
        throw new Error('Budget must be a finite numeric value');
      }
      if (num <= 0) {
        throw new Error('Budget must be a positive number greater than zero');
      }
      return true;
    })
    .bail()
    .custom((val, { req }) => {
      const num = Number(val);
      const catId = req.body?.categoryId;
      const limits = getCategoryLimits(catId);

      if (num < limits.min) {
        throw new Error(`Budget is below the permitted minimum for this category (minimum: ₹${limits.min.toLocaleString('en-IN')} for ${limits.name})`);
      }
      if (num > limits.max) {
        throw new Error(`Budget exceeds the permitted maximum for this category (maximum: ₹${limits.max.toLocaleString('en-IN')} for ${limits.name})`);
      }
      return true;
    }),

  // 5. Quantity validation (optional positive integer)
  body('quantity')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === undefined || val === null || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 10000) {
        throw new Error('Quantity must be a positive integer between 1 and 10,000');
      }
      return true;
    }),

  // 6. Urgency / Delivery timeline validation
  body('urgency')
    .exists({ checkFalsy: true }).withMessage('Delivery timeline / urgency is required')
    .bail()
    .isString().withMessage('Urgency must be a text string')
    .bail()
    .trim()
    .isIn(['Immediate', 'Within 1 week', 'Within 2 weeks', 'This month', 'Flexible'])
    .withMessage('Urgency must be one of: Immediate, Within 1 week, Within 2 weeks, This month, Flexible'),

  // 7. Location validation
  body('location')
    .exists({ checkFalsy: true }).withMessage('Location is required')
    .bail()
    .isString().withMessage('Location must be a text string')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters'),

  // 8. Buyer ID validation
  body('buyerId')
    .exists({ checkFalsy: true }).withMessage('Buyer ID is required')
    .bail()
    .isString().withMessage('Buyer ID must be a valid user identifier')
    .bail()
    .trim(),

  // 9. Optional imageUrl validation
  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((url) => {
      if (!url) return true;
      try {
        new URL(url);
        return true;
      } catch {
        throw new Error('Image URL must be a valid URL');
      }
    })
];

/**
 * Validation result handler middleware.
 * If validation fails, halts processing before any Firestore write occurs
 * and responds with HTTP 400 Bad Request and structured error details.
 */
export const validateRequirement = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  // Normalize numeric fields in request body so controller/service receives clean types
  req.body.title = req.body.title.trim();
  req.body.description = req.body.description.trim();
  req.body.location = req.body.location.trim();
  req.body.budget = Number(req.body.budget);
  req.body.quantity = req.body.quantity ? Number(req.body.quantity) : 1;

  next();
};
