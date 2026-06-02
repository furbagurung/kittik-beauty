import express from "express";
import {
    cancelOwnOrder,
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import { optionalOrderAuth } from "../middleware/orderAuthMiddleware.js";
const router = express.Router();

// CUSTOMER ROUTES
router.post("/", optionalOrderAuth, createOrder);
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, cancelOwnOrder);
// ADMIN ROUTES
router.patch("/:id/status", protect, isAdmin, updateOrderStatus);

export default router;
