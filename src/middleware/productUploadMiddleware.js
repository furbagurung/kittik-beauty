import fs from "fs";
import path from "path";
import multer from "multer";

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "uploads", "products");

fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

function sanitizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, PRODUCT_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "") || ".jpg";
    const baseName = path.basename(file.originalname || "product-image", extension);
    const safeName = sanitizeFilename(baseName) || "product-image";
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `${uniquePrefix}-${safeName}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 9,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype?.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image files are allowed"));
  },
});

const productUpload = upload.fields([
  { name: "primaryImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 8 },
]);

export function handleProductUpload(req, res, next) {
  productUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res
          .status(400)
          .json({ message: "Each image must be 5 MB or smaller" });
        return;
      }

      res.status(400).json({ message: error.message });
      return;
    }

    res.status(400).json({
      message: error.message || "Product image upload failed",
    });
  });
}
