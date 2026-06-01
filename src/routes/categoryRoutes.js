import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import {
  handleCategoryCoverUpload,
} from "../middleware/categoryUploadMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, isAdmin, handleCategoryCoverUpload, createCategory);
router.put("/:id", protect, isAdmin, handleCategoryCoverUpload, updateCategory);
router.patch("/:id", protect, isAdmin, handleCategoryCoverUpload, updateCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
