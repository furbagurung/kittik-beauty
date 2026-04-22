import fs from "fs";
import multer from "multer";
import path from "path";

const REEL_UPLOAD_DIR = path.join(process.cwd(), "uploads", "reels");

fs.mkdirSync(REEL_UPLOAD_DIR, { recursive: true });

function sanitizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, REEL_UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "") || "";
    const baseName = path.basename(file.originalname || "reel-media", extension);
    const safeName = sanitizeFilename(baseName) || "reel-media";
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `${uniquePrefix}-${safeName}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === "video" && file.mimetype?.startsWith("video/")) {
      callback(null, true);
      return;
    }

    if (
      file.fieldname === "thumbnail" &&
      file.mimetype?.startsWith("image/")
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Reels require one video file and an optional image thumbnail"));
  },
});

const reelUpload = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export function handleReelUpload(req, res, next) {
  reelUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Reel files must be 80 MB or smaller" });
        return;
      }

      res.status(400).json({ message: error.message });
      return;
    }

    res.status(400).json({
      message: error.message || "Reel upload failed",
    });
  });
}
