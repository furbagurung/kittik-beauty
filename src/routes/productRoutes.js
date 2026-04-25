import express from "express";
import { getCategories } from "../controllers/categoryController.js";
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    updateProduct,
} from "../controllers/productController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import { handleProductUpload } from "../middleware/productUploadMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// ADMIN ONLY
router.post("/", protect, isAdmin, handleProductUpload, createProduct);
router.put("/:id", protect, isAdmin, handleProductUpload, updateProduct);
router.patch("/:id", protect, isAdmin, handleProductUpload, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
