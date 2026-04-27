import fs from "fs";
import multer from "multer";
import path from "path";
import { UPLOADS_ROOT } from "../config/uploads.js";

const BANNER_UPLOAD_DIR = path.join(UPLOADS_ROOT, "banners");

fs.mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: BANNER_UPLOAD_DIR,
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadBanner = multer({ storage });
