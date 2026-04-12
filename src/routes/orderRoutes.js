import express from "express";
import {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);
export default router;
