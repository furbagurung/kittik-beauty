import express from "express";
import {
  createReel,
  deleteReel,
  getAdminReelById,
  getAdminReels,
  getReelById,
  getReels,
  likeReel,
  saveReel,
  trackReelProductClick,
  trackReelShare,
  trackReelView,
  unlikeReel,
  unsaveReel,
  updateReel,
} from "../controllers/reelController.js";
import { isAdmin, optionalAuth, protect } from "../middleware/authMiddleware.js";
import { handleReelUpload } from "../middleware/reelUploadMiddleware.js";

const router = express.Router();

// ADMIN READS
router.get("/admin", protect, isAdmin, getAdminReels);
router.get("/admin/:id", protect, isAdmin, getAdminReelById);

// PUBLIC
router.get("/", optionalAuth, getReels);
router.get("/:id", optionalAuth, getReelById);
router.post("/:id/view", optionalAuth, trackReelView);
router.post("/:id/share", optionalAuth, trackReelShare);
router.post("/:id/product-click", optionalAuth, trackReelProductClick);

// AUTHENTICATED BUYERS
router.post("/:id/like", protect, likeReel);
router.delete("/:id/like", protect, unlikeReel);
router.post("/:id/save", protect, saveReel);
router.delete("/:id/save", protect, unsaveReel);

// ADMIN ONLY
router.post("/", protect, isAdmin, handleReelUpload, createReel);
router.put("/:id", protect, isAdmin, handleReelUpload, updateReel);
router.patch("/:id", protect, isAdmin, handleReelUpload, updateReel);
router.delete("/:id", protect, isAdmin, deleteReel);

export default router;
