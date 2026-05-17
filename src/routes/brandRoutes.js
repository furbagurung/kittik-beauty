import express from "express";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../controllers/brandController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/", protect, isAdmin, createBrand);
router.put("/:id", protect, isAdmin, updateBrand);
router.patch("/:id", protect, isAdmin, updateBrand);
router.delete("/:id", protect, isAdmin, deleteBrand);

export default router;
