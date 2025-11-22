// import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
// import { organization, user } from "./auth";
// import { mimeEnum } from "./enums";
// import { image } from "./images";

// export const bucket = pgTable("buckets", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: text("name").notNull(),
//   slug: text("slug").notNull().unique(),
//   organizationId: text("organization_id")
//     .references(() => organization.id, { onDelete: "cascade" })
//     .notNull(),
//   metadata: text("metadata"),
//   createdAt: timestamp("created_at", { withTimezone: true })
//     .defaultNow()
//     .notNull(),
//   updatedAt: timestamp("updated_at", { withTimezone: true })
//     .defaultNow()
//     .notNull()
//     .$onUpdate(() => new Date()),
// });
// //
