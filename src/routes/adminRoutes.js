import express from "express";
import { getAdminCustomers } from "../controllers/adminCustomerController.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../controllers/adminOrderController.js";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../controllers/adminProductController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/dashboard", getAdminDashboard);

router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);

router.get("/customers", getAdminCustomers);

export default router;
