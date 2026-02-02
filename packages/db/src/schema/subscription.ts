import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { organization, user } from "./auth";

type SeatEntry = {
  orgId: (typeof organization.$inferSelect)["id"];
  members: number;
};

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usage = pgTable("usage", {
  id: text("id")
    .primaryKey()
    .$default(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transformations: integer("transformations").default(0).notNull(),
  storage: integer("storage").default(0).notNull(),
  cache: integer("cache").default(0).notNull(),
  buckets: integer("buckets").default(0).notNull(),
  seats: jsonb("seats").$type<SeatEntry[]>().default([]).notNull(),
  bandwidth: integer("bandwidth").default(0).notNull(),

  cycleStart: timestamp("cycle_start").notNull().defaultNow(),
  cycleEnd: timestamp("cycle_end")
    .$defaultFn(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    })
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Extract metric columns - these are the trackable usage metrics
export const USAGE_METRIC_KEYS = [
  "transformations",
  "storage",
  "cache",
  "buckets",
  "seats",
  "bandwidth",
] as const satisfies ReadonlyArray<keyof typeof usage.$inferSelect>;

export const USAGE_FIELDS = Object.fromEntries(USAGE_METRIC_KEYS.map((key) => [key, usage[key]]));

export type UsageMetricKey = (typeof USAGE_METRIC_KEYS)[number];
