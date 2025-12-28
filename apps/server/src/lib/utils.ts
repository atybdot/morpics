import { db } from "@morpics/db";
import { drizzle } from "@morpics/db/dirzzle";
import * as tables from "@morpics/db/schema";
export async function getOwner({
  bucketSlug,
  key,
}: {
  bucketSlug: string;
  key: string;
}) {
  const ownerQuery = db
    .select({ userId: tables.member.userId })
    .from(tables.member)
    .where(drizzle.eq(tables.member.role, "owner"))
    .limit(1)
    .as("owner");
  const imgQuery = db
    .select()
    .from(tables.image)
    .where(
      drizzle.and(
        drizzle.eq(tables.image.bucket_slug, bucketSlug),
        drizzle.eq(tables.image.key, `${bucketSlug}/${key}`),
      ),
    )
    .as("img");
  const owner = await db
    .select()
    .from(tables.organization)
    .where(drizzle.eq(tables.organization.slug, bucketSlug))
    .crossJoin(ownerQuery)
    .crossJoin(imgQuery)
    .innerJoin(tables.user, drizzle.eq(ownerQuery.userId, tables.user.id));
  if (owner.length === 0) {
    return null;
  }

  return owner[0];
}
