import express from "express";
import {
  addCustomerWishlistItem,
  createCustomerAddress,
  deleteCustomerAddress,
  deleteCustomerWishlistItem,
  getCustomerAddresses,
  getCustomerOrderById,
  getCustomerOrders,
  getCustomerRecentlyViewed,
  getCustomerWishlist,
  setDefaultCustomerAddress,
  trackCustomerRecentlyViewed,
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
router.get("/wishlist", protectCustomer, getCustomerWishlist);
router.post("/wishlist", protectCustomer, addCustomerWishlistItem);
router.delete("/wishlist/:productId", protectCustomer, deleteCustomerWishlistItem);
router.get("/recently-viewed", protectCustomer, getCustomerRecentlyViewed);
router.post("/recently-viewed", protectCustomer, trackCustomerRecentlyViewed);
router.post("/logout", protectCustomer, logoutCustomer);

export default router;
