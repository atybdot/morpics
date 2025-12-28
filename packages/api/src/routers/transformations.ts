import z from "zod";
import { protectedProcedure } from "..";
import { db } from "@morpics/db";
import * as schema from "@morpics/db/schema";
import { drizzle } from "@morpics/db/dirzzle";
import { usageHelpers } from "@morpics/db/helpers/usage";

const mutations = {
  // delete: protectedProcedure
  //   .route({ path: "/transformation", method: "DELETE" })
  //   .input(z.object({ imgKey: z.string().min(1) }))
  //   .handler(async ({ input,context }) => {
  //        const [dbImg, r2img] = await Promise.all([
  //               db.query.image.findFirst({
  //                 where: (f, o) =>
  //                   o.and(
  //                     o.eq(f.key, input.key),
  //                     o.eq(f.orgId, input.bucketId),
  //                   ),
  //                 columns: { key: true, orgId: true, userId: true, id: true },
  //               }),
  //               env.IMAGES.head(input.key),
  //             ]);
  //             const deleteImgPromise = [];
  //             if (dbImg) {
  //               deleteImgPromise.push(
  //                 db
  //                   .delete(schema.image)
  //                   .where(drizzle.eq(schema.image.id, dbImg.id))
  //                   .returning(),
  //               );
  //             }
  //             if (r2img) {
  //               deleteImgPromise.push(
  //                 usageHelpers.decrementMetric({
  //                   userId: context.session.user.id,
  //                   metric: "storage",
  //                   value: r2img.size,
  //                 }),
  //               );
  //               deleteImgPromise.push(env.IMAGES.delete(input.key));
  //             }
  //             return (await Promise.allSettled(deleteImgPromise))
  //               .filter((pr) => pr.status === "fulfilled")
  //               .map((itm) => itm.value);
  //           }),
  //   const [del, _] = await Promise.all([
  //     db
  //       .delete(schema.transformation)
  //       .where(drizzle.eq(schema.transformation.imageId, input.imgKey)),
  //       usageHelpers.decrementMetric({
  //         userId: context.session.user.id,
  //         metric: "transformations",
  //         value: 1,
  //       }),
  //   ]);
  //   return { success: true };
  // }),
};
const queries = {
  get: protectedProcedure
    .route({ path: "/image/transformation", method: "GET" })
    .input(z.object({ imgId: z.string().min(1) }))
    .handler(async ({ input }) => {
      return await db.query.transformation.findMany({
        where: (f, o) => o.eq(f.imageId, input.imgId),
      });
    }),
};
export const transformationRoutes = { ...mutations, ...queries };
