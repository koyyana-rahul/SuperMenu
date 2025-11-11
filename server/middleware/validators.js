import { body, validationResult } from "express-validator";

export const validateRegistration = [
  // Sanitize and validate name
  body("name").trim().notEmpty().withMessage("Name is required."),

  // Sanitize and validate email
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  // Validate password
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/\d/)
    .withMessage("Password must contain a number.")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter."),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
