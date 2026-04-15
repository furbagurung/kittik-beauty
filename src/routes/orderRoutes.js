import express from "express";
import {
    cancelOwnOrder,
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.use(protect);

// CUSTOMER ROUTES
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOwnOrder);
// ADMIN ROUTES
router.patch("/:id/status", isAdmin, updateOrderStatus);

export default router;
