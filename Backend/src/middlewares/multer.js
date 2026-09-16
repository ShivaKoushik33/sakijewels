import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import multer from "multer";

/**
 * Product image uploads.
 *
 * The filename is generated, never taken from the client: multer joins the
 * destination and filename with path.join, so a client-supplied name
 * containing "../" wrote outside the upload directory.
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, os.tmpdir());
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname || "").toLowerCase().slice(0, 10);
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : "";
    callback(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 4,
    fields: 30,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, WEBP or AVIF images are allowed"));
    }
    callback(null, true);
  },
});

export default upload;
