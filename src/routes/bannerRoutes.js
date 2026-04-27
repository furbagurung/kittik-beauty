import express from "express";
import {
    createBanner,
    deleteBanner,
    getBanners,
} from "../controllers/bannerController.js";

const router = express.Router();

router.get("/", getBanners);
router.post("/", createBanner);
router.delete("/:id", deleteBanner);

export default router;