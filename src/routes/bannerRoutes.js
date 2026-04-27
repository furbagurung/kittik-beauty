import express from "express";
import {
  createBanner,
  deleteBanner,
  getBanners,
} from "../controllers/bannerController.js";
import { uploadBanner } from "../middleware/uploadBanner.js";

const router = express.Router();

router.get("/", getBanners);
router.post("/", uploadBanner.single("image"), createBanner);
router.delete("/:id", deleteBanner);

export default router;
