import express from "express";
import { register, login, getProfile,getAdminAllUser } from "../controllers/authController.js";
import { registerValidation, loginValidation } from "../middlewares/validationMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validationResult } from "express-validator";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/profile", protect, getProfile);
router.get("/getAllUser",protect,getAdminAllUser)

export default router;
