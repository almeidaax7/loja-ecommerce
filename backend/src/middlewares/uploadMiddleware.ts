import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB) || 5;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  // Evita colisão de nomes: gera um nome único (uuid) preservando a extensão original
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extensionOk = ALLOWED_EXTENSIONS.includes(ext);
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!extensionOk || !mimeOk) {
    return cb(new Error(`Extensão de arquivo não permitida. Use: ${ALLOWED_EXTENSIONS.join(", ")}`));
  }
  cb(null, true);
}

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
  },
});

export const UPLOAD_URL_PREFIX = "/uploads/products";