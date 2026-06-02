import express from "express";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerOrderById,
  getCustomerOrders,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "../controllers/customerAccountController.js";
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
router.get("/orders", protectCustomer, getCustomerOrders);
router.get("/orders/:id", protectCustomer, getCustomerOrderById);
router.get("/addresses", protectCustomer, getCustomerAddresses);
router.post("/addresses", protectCustomer, createCustomerAddress);
router.patch("/addresses/:id/default", protectCustomer, setDefaultCustomerAddress);
router.patch("/addresses/:id", protectCustomer, updateCustomerAddress);
router.delete("/addresses/:id", protectCustomer, deleteCustomerAddress);
router.post("/logout", protectCustomer, logoutCustomer);

export default router;
