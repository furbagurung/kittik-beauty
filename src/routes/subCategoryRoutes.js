import express from "express";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
} from "../controllers/subCategoryController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSubCategories);
router.get("/category/:categoryId", getSubCategoriesByCategory);
router.get("/:id", getSubCategoryById);
router.post("/", protect, isAdmin, createSubCategory);
router.put("/:id", protect, isAdmin, updateSubCategory);
router.patch("/:id", protect, isAdmin, updateSubCategory);
router.delete("/:id", protect, isAdmin, deleteSubCategory);

export default router;
