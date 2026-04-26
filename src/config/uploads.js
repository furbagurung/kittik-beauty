import path from "path";

export const UPLOADS_ROOT =
  process.env.UPLOADS_ROOT || path.resolve(process.cwd(), "uploads");
export const PRODUCT_UPLOAD_DIR = path.join(UPLOADS_ROOT, "products");
export const REEL_UPLOAD_DIR = path.join(UPLOADS_ROOT, "reels");
