import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const imageStatusEnum = pgEnum("image_status_enum", [
  "pending",
  "success",
  "failed",
  "orphan",
]);
export const mimeEnum = pgEnum("mime_enum", [
  "image/png",
  "image/webp",
  "image/avif",
  "image/jpeg",
  "image/tiff",
  "image/jp2",
]);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    lastLoginMethod: text("last_login_method"),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const apikey = pgTable(
  "apikey",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    start: text(),
    prefix: text(),
    key: text().notNull(),
    userId: text("user_id").notNull(),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at", { mode: "string" }),
    enabled: boolean().default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
    rateLimitMax: integer("rate_limit_max").default(10),
    requestCount: integer("request_count").default(0),
    remaining: integer(),
    lastRequest: timestamp("last_request", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    permissions: text(),
    metadata: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "apikey_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const organization = pgTable(
  "organization",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    logo: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    metadata: text(),
  },
  (table) => [unique("organization_slug_unique").on(table.slug)],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    email: text().notNull(),
    role: text(),
    status: text().default("pending").notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    inviterId: text("inviter_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "invitation_organization_id_organization_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [user.id],
      name: "invitation_inviter_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const member = pgTable(
  "member",
  {
    id: text().primaryKey().notNull(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    role: text().default("member").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "member_organization_id_organization_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "member_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const transformation = pgTable(
  "transformation",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    imageId: uuid("image_id").notNull(),
    cacheKey: text("cache_key"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.imageId],
      foreignColumns: [images.id],
      name: "transformation_image_id_images_id_fk",
    }).onDelete("cascade"),
  ],
);

export const images = pgTable(
  "images",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    imageKey: text("image_key").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    organizationId: text("organization_id").notNull(),
    status: imageStatusEnum().default("pending").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "images_user_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "images_organization_id_organization_id_fk",
    }).onDelete("cascade"),
    unique("images_image_key_unique").on(table.imageKey),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("tags_name_unique").on(table.name)],
);

export const filters = pgTable(
  "filters",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    transformationId: uuid("transformation_id").notNull(),
    blur: integer(),
    grayscale: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.transformationId],
      foreignColumns: [transformation.id],
      name: "filters_transformation_id_transformation_id_fk",
    }).onDelete("cascade"),
    unique("filters_transformation_id_unique").on(table.transformationId),
  ],
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const imageMetadata = pgTable(
  "image_metadata",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    imageId: uuid("image_id").notNull(),
    fileName: text("file_name"),
    description: text(),
    altText: text("alt_text"),
    mimetype: mimeEnum().notNull(),
    fileSize: integer("file_size").notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.imageId],
      foreignColumns: [images.id],
      name: "image_metadata_image_id_images_id_fk",
    }).onDelete("cascade"),
    unique("image_metadata_image_id_unique").on(table.imageId),
  ],
);

export const transformationMetadata = pgTable(
  "transformation_metadata",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    transformationId: uuid("transformation_id").notNull(),
    fileSize: integer("file_size").notNull(),
    width: integer(),
    height: integer(),
    rotation: integer(),
    mimetype: mimeEnum(),
    quality: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.transformationId],
      foreignColumns: [transformation.id],
      name: "transformation_metadata_transformation_id_transformation_id_fk",
    }).onDelete("cascade"),
    unique("transformation_metadata_transformation_id_unique").on(
      table.transformationId,
    ),
  ],
);

export const imageTags = pgTable(
  "image_tags",
  {
    imageId: uuid("image_id").notNull(),
    tagId: uuid("tag_id").notNull(),
    value: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.imageId],
      foreignColumns: [images.id],
      name: "image_tags_image_id_images_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "image_tags_tag_id_tags_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.imageId, table.tagId],
      name: "image_tags_image_id_tag_id_pk",
    }),
  ],
);
