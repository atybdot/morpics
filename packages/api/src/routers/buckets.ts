import { db } from "@morpics/db";
import { drizzle } from "@morpics/db/dirzzle";
import * as schema from "@morpics/db/schema";
import z from "zod";
import { protectedProcedure } from "..";

const queries = {
  stats: protectedProcedure
    .route({ path: "/bucket/stats" })
    .meta({ "description:": "Get an image for a specified bucket " })
    .input(z.object({ bucket: z.string(), bucketId: z.string() }))
    .handler(async ({ input }) => {
      const [memberCount, imageCount, transformedImageCount] =
        await Promise.all([
          db
            .select({ count: drizzle.count() })
            .from(schema.member)
            .where(drizzle.eq(schema.member.organizationId, input.bucketId))
            .then((result) => result[0]?.count ?? 0),

          db
            .select({ count: drizzle.count() })
            .from(schema.image)
            .where(drizzle.eq(schema.image.bucket_slug, input.bucket))
            .then((result) => result[0]?.count ?? 0),

          db
            .select({
              count: drizzle.countDistinct(schema.transformation.imageId),
            })
            .from(schema.transformation)
            .innerJoin(
              schema.image,
              drizzle.eq(schema.transformation.imageId, schema.image.id),
            )
            .where(drizzle.eq(schema.image.bucket_slug, input.bucket))
            .then((result) => result[0]?.count ?? 0),
        ]);

      return {
        bucketId: input.bucketId,
        members: memberCount,
        images: imageCount,
        transformations: transformedImageCount,
      };
    }),
};

export const bucketRoutes = { ...queries };
