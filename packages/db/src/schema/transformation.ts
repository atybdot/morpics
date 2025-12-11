import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { mimeEnum } from "./enums";
import { image } from "./images";

export const transformation = pgTable("transformation", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .references(() => image.id, { onDelete: "cascade" }),
  cache_key: text("cache_key"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const transformation_metadata = pgTable("transformation_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  transformationId: uuid("transformation_id")
    .notNull()
    .references(() => transformation.id, {
      onDelete: "cascade",
    })
    .unique(),
  fileSize: integer("file_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  rotate: integer("rotation"),
  mimetype: mimeEnum("mimetype"),
  quality: integer("quality"),
});

export const filters = pgTable("filters", {
  id: uuid("id").primaryKey().defaultRandom(),
  transformationId: uuid("transformation_id")
    .notNull()
    .references(() => transformation.id, { onDelete: "cascade" })
    .unique(),
  blur: integer("blur"),
  grayscale: integer("grayscale"),
});
