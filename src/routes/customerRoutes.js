import express from "express";
import {
  changeCustomerPassword,
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from "../controllers/customerAuthController.js";
import { protectCustomer } from "../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectCustomer, getCurrentCustomer);
router.patch("/profile", protectCustomer, updateCustomerProfile);
router.post("/change-password", protectCustomer, changeCustomerPassword);
router.post("/logout", protectCustomer, logoutCustomer);

export default router;
