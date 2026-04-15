import express from "express";
import {
    adminLogin,
    getAdminStats,
    getAllUsers,
    getRecentOrders,
    login,
    signup,
} from "../controllers/authController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/admin/stats", protect, isAdmin, getAdminStats);
router.get("/admin/recent-orders", protect, isAdmin, getRecentOrders);
export default router;
