import express from "express";
import {
  getCurrentUser,
  login,
  signup,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

export default router;
