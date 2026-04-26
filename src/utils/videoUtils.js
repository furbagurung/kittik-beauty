import { exec } from "child_process";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export function generateReelThumbnail(videoPath, uploadsRoot) {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}-${uuidv4()}.jpg`;
    const outputPath = path.join(uploadsRoot, "reels", fileName);

    const command = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error("❌ FFmpeg thumbnail error:", error);
        return reject(error);
      }

      // return public path
      resolve(`/uploads/reels/${fileName}`);
    });
  });
}