import { execFile } from "child_process";
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

export async function generateReelThumbnail(videoPath, outputPath, time = "00:00:01") {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${videoPath}" -ss ${time} -vframes 1 "${outputPath}"`;

    exec(command, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}
