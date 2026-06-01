import express from "express";
import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "../controllers/customerAuthController.js";
import { protectCustomer } from "../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectCustomer, getCurrentCustomer);
router.post("/logout", protectCustomer, logoutCustomer);

export default router;
