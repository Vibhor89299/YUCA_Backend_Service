import { body } from "express-validator";

export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const profileUpdateValidation = [
  body("name").notEmpty().trim().withMessage("Name is required"),
  body("phone").optional().isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10-15 characters"),
  body("location").optional().isLength({ max: 100 }).withMessage("Location must be less than 100 characters"),
];
