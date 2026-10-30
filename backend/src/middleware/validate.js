const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateJob = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('employmentType').trim().notEmpty().withMessage('Employment type is required'),
  body('experienceLevel').trim().notEmpty().withMessage('Experience level is required'),
  body('workMode').trim().notEmpty().withMessage('Work mode is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  handleValidationErrors,
];

const validateApplication = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  handleValidationErrors,
];

const validateCompany = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  handleValidationErrors,
];

const validateInterview = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('duration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  handleValidationErrors,
];

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  handleValidationErrors,
];

module.exports = { validateJob, validateApplication, validateCompany, validateInterview, validateReview };
