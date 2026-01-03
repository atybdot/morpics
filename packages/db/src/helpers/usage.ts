import { drizzle } from "../dirzzle";
import { db } from "../index";
import { PRICING_TABLE, type UserTier } from "../schema/constants";
import {
  type UsageMetricKey,
  usage as usageSchema,
} from "../schema/subscription";
import { getLimitValue } from "./index";

export interface Base {
  userId: string;
  metric: UsageMetricKey;
}
export interface IngestMetric extends Base {
  value?: number;
  orgId?: string;
}

interface OrgSeatLimit {
  userId: string;
  orgId: string;
  userTier: UserTier;
}
// Helper functions for usage management
export const usageHelpers = {
  /**
   * Get current usage for a user
   */
  async getUsage(userId: string) {
    let usage = await db.query.usage.findFirst({
      where: (f, o) => o.eq(f.userId, userId),
    });
    if (!usage) {
      await db.insert(usageSchema).values({ userId });
      usage = await db.query.usage.findFirst({
        where: (f, o) => o.eq(f.userId, userId),
      });
    }
    return usage;
  },

  /**
   * Get all limits for a specific user tier
   */
  getLimits(userTier: UserTier = "free") {
    const tier = userTier as UserTier;
    return PRICING_TABLE[tier]?.package ?? PRICING_TABLE.free.package;
  },

  /**
   * Check if user can perform an action based on usage limits
   */
  async canUse({
    userId,
    metric,
    userTier = "free",
  }: Base & { userTier: UserTier }) {
    const usage = await this.getUsage(userId);
    const limits =
      PRICING_TABLE[userTier as keyof typeof PRICING_TABLE]?.package;

    if (!limits || !limits[metric as keyof typeof limits]) {
      return false;
    }

    const limitConfig = limits[metric as keyof typeof limits];
    const currentValue = usage?.[metric as keyof typeof usage] ?? 0;

    // Handle numeric fields
    if (typeof currentValue === "number") {
      return currentValue < getLimitValue(limitConfig);
    }

    // Handle seats array
    if (metric === "seats" && Array.isArray(currentValue)) {
      const maxAllowed = getLimitValue(limitConfig);
      return currentValue.every((seat) => seat.members <= maxAllowed);
    }

    return false;
  },

  /**
   * Increment a metric for a user
   */
  async incrementMetric({ userId, metric, value = 1, orgId }: IngestMetric) {
    if (metric === "seats") {
      if (!orgId) throw new Error("orgId required for seats operations");

      const usage = await this.getUsage(userId);
      const seats = usage?.seats || [];
      const orgSeatIndex = seats.findIndex((s) => s.orgId === orgId);

      if (orgSeatIndex === -1) {
        seats.push({ orgId, members: value });
      } else {
        seats[orgSeatIndex] = {
          ...seats[orgSeatIndex],
          members: (seats[orgSeatIndex]?.members ?? 0) + value,
          orgId,
        };
      }

      return db
        .update(usageSchema)
        .set({ seats })
        .where(drizzle.eq(usageSchema.userId, userId))
        .returning();
    }

    // Handle numeric fields
    const field = usageSchema[metric as keyof typeof usageSchema];
    return db
      .update(usageSchema)
      .set({
        [metric]: drizzle.sql`${field} + ${value}`,
      })
      .where(drizzle.eq(usageSchema.userId, userId))
      .returning();
  },

  /**
   * Decrement a metric for a user
   */
  async decrementMetric({ userId, metric, value = 1, orgId }: IngestMetric) {
    if (metric === "seats") {
      if (!orgId) throw new Error("orgId required for seats operations");

      const usage = await this.getUsage(userId);
      const seats = usage?.seats || [];
      const orgSeatIndex = seats.findIndex((s) => s.orgId === orgId);

      if (orgSeatIndex !== -1) {
        const currentMembers = seats[orgSeatIndex]?.members ?? 0;
        seats[orgSeatIndex] = {
          ...seats[orgSeatIndex],
          members: Math.max(0, currentMembers - value),
          orgId,
        };
      }

      return db
        .update(usageSchema)
        .set({ seats })
        .where(drizzle.eq(usageSchema.userId, userId))
        .returning();
    }

    // Handle numeric fields
    const field = usageSchema[metric as keyof typeof usageSchema];
    return db
      .update(usageSchema)
      .set({
        [metric]: drizzle.sql`${field} - ${value}`,
      })
      .where(drizzle.eq(usageSchema.userId, userId))
      .returning();
  },

  /**
   * Check if org members are within seat limit
   */
  async checkOrgSeatsLimit({ userId, orgId, userTier = "free" }: OrgSeatLimit) {
    const usage = await this.getUsage(userId);
    const limits =
      PRICING_TABLE[userTier as keyof typeof PRICING_TABLE]?.package;

    if (!limits) return false;

    const seats = Array.isArray(usage?.seats) ? usage.seats : [];
    const org = seats.find((s) => s.orgId === orgId);
    const membersCount = org?.members ?? 0;
    const maxAllowed = getLimitValue(limits.seats);

    return membersCount < maxAllowed;
  },

  /**
   * Check all metrics for a user against their tier limits
   * Returns a map of metric -> status/details
   */
  async checkAllMetrics({
    userId,
    userTier = "free",
  }: {
    userId: string;
    userTier: UserTier;
  }) {
    type LimitConfig = { allowed: number; unit?: string };
    type SeatsEntry = { orgId: string; members: number };

    const usage = await this.getUsage(userId);
    const limits =
      PRICING_TABLE[userTier as keyof typeof PRICING_TABLE]?.package ??
      PRICING_TABLE.free.package;

    const result: Record<string, unknown> = {};
    const typedLimits = limits as Record<string, LimitConfig>;
    const usageRec = (usage ?? {}) as Record<string, unknown>;

    for (const metric of Object.keys(typedLimits)) {
      const limitConfig = typedLimits[metric] as LimitConfig | undefined;
      if (!limitConfig) continue;

      if (metric === "seats") {
        const seatsRaw = usageRec["seats"];
        const seats: SeatsEntry[] = Array.isArray(seatsRaw)
          ? (seatsRaw as SeatsEntry[])
          : [];
        const maxPerOrg = getLimitValue(limitConfig);
        const allowed = seats.every((seat) => (seat?.members ?? 0) < maxPerOrg);

        result[metric] = {
          allowed,
          seats,
          maxPerOrg,
        };
        continue;
      }

      const currentRaw = usageRec[metric];
      const currentValue = typeof currentRaw === "number" ? currentRaw : 0;

      if (typeof currentValue === "number") {
        const max = getLimitValue(limitConfig);
        result[metric] = {
          allowed: currentValue < max,
          current: currentValue,
          max,
          remaining: Math.max(0, max - currentValue),
        } as {
          allowed: boolean;
          current: number;
          max: number;
          remaining: number;
        };
      } else {
        // Fallback for unexpected types
        result[metric] = {
          allowed: false,
          current: currentRaw,
          max: getLimitValue(limitConfig),
        };
      }
    }

    return result;
  },
};
