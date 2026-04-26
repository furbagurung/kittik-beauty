import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { REEL_UPLOAD_DIR } from "../config/uploads.js";

const execFileAsync = promisify(execFile);
const REEL_UPLOAD_PREFIX = "/uploads/reels/";

function normalizeReelPublicPath(value) {
  if (!value) return null;

  const normalized = String(value).trim().replace(/\\/g, "/");
  if (!normalized) return null;
  if (normalized.startsWith(REEL_UPLOAD_PREFIX)) return normalized;
  if (normalized.startsWith("uploads/reels/")) return `/${normalized}`;

  return null;
}

function resolveReelUploadPath(filename) {
  const uploadRoot = path.resolve(REEL_UPLOAD_DIR);
  const absolutePath = path.resolve(uploadRoot, filename);
  const isInsideReelRoot =
    absolutePath === uploadRoot ||
    absolutePath.startsWith(`${uploadRoot}${path.sep}`);

  return isInsideReelRoot ? absolutePath : null;
}

export function reelPublicPathToAbsolutePath(value) {
  const publicPath = normalizeReelPublicPath(value);
  if (!publicPath) return null;

  const filename = publicPath.slice(REEL_UPLOAD_PREFIX.length);
  if (!filename || filename.includes("/")) return null;

  return resolveReelUploadPath(filename);
}

export function buildGeneratedReelThumbnailPaths(videoPublicPath) {
  const publicPath = normalizeReelPublicPath(videoPublicPath);
  if (!publicPath) return null;

  const videoFilename = publicPath.slice(REEL_UPLOAD_PREFIX.length);
  if (!videoFilename || videoFilename.includes("/")) return null;

  const videoBaseName =
    path.basename(videoFilename, path.extname(videoFilename)) || "reel-video";
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const thumbnailFilename = `${videoBaseName}-thumbnail-${uniqueSuffix}.jpg`;
  const absolutePath = resolveReelUploadPath(thumbnailFilename);

  if (!absolutePath) return null;

  return {
    absolutePath,
    publicPath: `${REEL_UPLOAD_PREFIX}${thumbnailFilename}`,
  };
}

export async function generateReelThumbnail(videoPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await execFileAsync(
      "ffmpeg",
      ["-y", "-ss", "1", "-i", videoPath, "-frames:v", "1", "-q:v", "2", outputPath],
      {
        shell: false,
        timeout: 30000,
        windowsHide: true,
      },
    );
  } catch (error) {
    const stderr = String(error?.stderr ?? "").trim();
    const message = stderr || error?.message || "ffmpeg thumbnail generation failed";

    throw new Error(message);
  }
}
