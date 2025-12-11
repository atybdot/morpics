import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organization, user } from "./auth";
import { imageStatusEnum, mimeEnum } from "./enums";

export const image = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("image_key").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  orgId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  uploadingStatus: imageStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const tag = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const imageTags = pgTable(
  "image_tags",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => image.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.imageId, table.tagId] })],
);

export const metadata = pgTable("image_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .references(() => image.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  fileName: text("file_name"),
  description: text("description"),
  altText: text("alt_text"),
  mimeType: mimeEnum("mimetype").notNull(),
  fileSize: integer("file_size").notNull(),

  width: integer("width").notNull(),
  height: integer("height").notNull(),

  // aiPrompt: text("ai_prompt"),
  // aiModel: text("ai_model"),
  // detectedObjects: jsonb("detected_objects"),
  // dominantColors: text("dominant_colors").array(),
});

// // Relations
export const imageRelations = relations(image, ({ one, many }) => ({
  metadata: one(metadata, {
    fields: [image.id],
    references: [metadata.imageId],
  }),
  imageTags: many(imageTags),
  user: one(user, {
    fields: [image.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [image.orgId],
    references: [organization.id],
  }),
}));

export const metadataRelations = relations(metadata, ({ one }) => ({
  image: one(image, {
    fields: [metadata.imageId],
    references: [image.id],
  }),
}));

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
  image: one(image, {
    fields: [imageTags.imageId],
    references: [image.id],
  }),
  tag: one(tag, {
    fields: [imageTags.tagId],
    references: [tag.id],
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  imageTags: many(imageTags),
}));
