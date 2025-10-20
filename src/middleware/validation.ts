import { body } from 'express-validator';

// User validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUpdateProfile = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('profilePic').custom((value, { req }) => {
    const file = req.file;
    if (!file) return true; // Skip if no file uploaded

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Only JPEG and PNG images are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('Profile picture must be less than 2MB');
    }
    return true;
  }),
];

// Music validation rules
export const validateCreateMusic = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),
  body('artist')
    .notEmpty()
    .withMessage('Artist is required')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters')
    .trim(),
  body('album')
    .notEmpty()
    .withMessage('Album is required')
    .isLength({ max: 100 })
    .withMessage('Album name cannot exceed 100 characters')
    .trim(),
  body('genres')
    .custom((value, { req }) => {
      // Handle both single and multiple genre inputs
      const genres = Array.isArray(value) ? value : [value];

      if (genres.length === 0) {
        throw new Error('At least one genre is required');
      }

      if (!genres.every(genre => typeof genre === 'string' && genre.trim().length > 0)) {
        throw new Error('All genres must be non-empty strings');
      }
      return true;
    })
];

export const validateUpdateMusic = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),
  body('artist')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters')
    .trim(),
  body('album')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Album name cannot exceed 100 characters')
    .trim(),
  body('genres')
    .optional()
    .custom((value, { req }) => {
      // Handle both single and multiple genre inputs
      const genres = Array.isArray(value) ? value : [value];

      if (genres.length === 0) {
        throw new Error('At least one genre is required');
      }

      if (!genres.every(genre => typeof genre === 'string' && genre.trim().length > 0)) {
        throw new Error('All genres must be non-empty strings');
      }
      return true;
    })
];
