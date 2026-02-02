import { db } from "..";
import { drizzle } from "../dirzzle";
import { member, user } from "../schema";

export const getOrgOwner = async (orgId: string, userId?: string) => {
  const members = await db
    .select({ count: drizzle.count() })
    .from(member)
    .where(drizzle.eq(member.organizationId, orgId));

  if (members[0]?.count === 0) {
    const userData = await db.query.user.findFirst({
      where: drizzle.eq(user.id, userId ?? ""),
    });
    return { user: userData };
  }
  const row = await db
    .select()
    .from(member)
    .innerJoin(user, drizzle.eq(member.userId, user.id))
    .where(drizzle.and(drizzle.eq(member.organizationId, orgId), drizzle.eq(member.role, "owner")))
    .limit(1);

  if (!row[0]) {
    throw new Error("Unable to get owner details");
  }

  return row[0];
};

export const getLimitValue = (item: { allowed: number; unit?: string }) => {
  if (item.unit === "k") return item.allowed * 1000;
  if (item.unit === "gb") return item.allowed * 1024 * 1024 * 1024;
  return item.allowed;
};
