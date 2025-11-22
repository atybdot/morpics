import { pgEnum } from "drizzle-orm/pg-core";

export const mimeEnum = pgEnum("mime_enum", [
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/jpeg",
  "image/tiff",
  "image/jp2",
]);

export const imageStatusEnum = pgEnum("image_status_enum", [
  "pending",
  "success",
  "failed",
  "orphan",
]);
