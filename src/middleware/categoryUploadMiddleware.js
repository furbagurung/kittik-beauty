import fs from "fs";
import path from "path";
import multer from "multer";
import { CATEGORY_UPLOAD_DIR } from "../config/uploads.js";

fs.mkdirSync(CATEGORY_UPLOAD_DIR, { recursive: true });

function sanitizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, CATEGORY_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "") || ".jpg";
    const baseName = path.basename(
      file.originalname || "category-cover",
      extension,
    );
    const safeName = sanitizeFilename(baseName) || "category-cover";
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `${uniquePrefix}-${safeName}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype?.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image files are allowed"));
  },
});

const categoryCoverUpload = upload.single("coverImage");

export function handleCategoryCoverUpload(req, res, next) {
  categoryCoverUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res
          .status(400)
          .json({ message: "Category cover image must be 5 MB or smaller" });
        return;
      }

      res.status(400).json({ message: error.message });
      return;
    }

    res.status(400).json({
      message: error.message || "Category cover image upload failed",
    });
  });
}
