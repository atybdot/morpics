import { env } from "cloudflare:workers";
import { r2Client } from "@morpics/buckets/server";
import { generatePresingedURL } from "@morpics/buckets/utils";
import { db } from "@morpics/db";
import { drizzle } from "@morpics/db/dirzzle";
import * as schemas from "@morpics/db/schema";
import z from "zod";
import { protectedProcedure } from "..";
import { imageInfoSchema, updateInfoSchema } from "../schemas";

const mutations = {
  // mutateImageStatus: protectedProcedure
  //   .route({ method: "PATCH", path: "/mutate-status" })
  //   .input(mutateImageStatusSchema.input)
  //   .handler(async ({ input: { imageKey, status } }) => {
  //     const createImagesPromises = await Promise.allSettled(
  //       imageKey.map((key) => {
  //         if (status === "failed") {
  //           return db
  //             .delete(schemas.image)
  //             .where(drizzle.eq(schemas.image.key, key))
  //             .returning();
  //         }
  //         return db
  //           .update(schemas.image)
  //           .set({ uploadingStatus: status })
  //           .where(drizzle.eq(schemas.image.key, key))
  //           .returning();
  //       }),
  //     );
  //     const failedMutations = createImagesPromises
  //       .filter((promise) => promise.status === "rejected")
  //       .map((promise) => promise.reason);
  //     return failedMutations;
  //   }),
  // updateInfo: protectedProcedure
  //   .route({ method: "PATCH", path: "/update-image-info" })
  //   .input(updateInfoSchema)
  //   .handler(async ({ input: { altTxt, tags, ...restInput } }) => {
  //     const metadataUpdate = await db
  //       .update(schemas.metadata)
  //       .set({
  //         altText: altTxt,
  //         ...restInput,
  //       })
  //       .where(drizzle.eq(schemas.metadata.imageId, restInput.imgId))
  //       .returning();
  //     if (restInput.key) {
  //       const newKey = restInput.key;
  //       await db.query.image
  //         .findFirst({ where: (f) => drizzle.eq(f.id, restInput.imgId) })
  //         .then(async (res) => {
  //           const r2Old = await env.IMAGES.get(res?.key as string);
  //           if (r2Old) {
  //             await env.IMAGES.put(newKey, r2Old.body, {
  //               httpMetadata: r2Old.httpMetadata,
  //               customMetadata: r2Old.customMetadata,
  //             });
  //           }
  //         });
  //       await db
  //         .update(schemas.image)
  //         .set({ key: restInput.key })
  //         .where(drizzle.eq(schemas.image.id, restInput.imgId));
  //     }
  //     // Handle tags: delete all existing and insert new ones
  //     if (tags !== undefined) {
  //       await db
  //         .delete(schemas.imageTags)
  //         .where(drizzle.eq(schemas.imageTags.imageId, restInput.imgId));
  //       if (tags.length > 0) {
  //         const tagValues = tags.map((tag) => ({
  //           imageId: restInput.imgId,
  //           tagId: tag.id,
  //           value: tag.value,
  //         }));
  //         await db
  //           .insert(schemas.imageTags)
  //           .values(tagValues)
  //           .onConflictDoNothing();
  //       }
  //     }
  //     return metadataUpdate;
  //   }),
  // createImgInfo: protectedProcedure
  //   .route({ method: "POST", path: "/create-image-info" })
  //   .input(imageInfoSchema)
  //   .handler(async ({ input }) => {
  //     return db
  //       .insert(schemas.metadata)
  //       .values({
  //         ...input,
  //       })
  //       .onConflictDoUpdate({ target: schemas.metadata.id, set: { ...input } })
  //       .returning();
  //   }),
  // createTag: protectedProcedure
  //   .route({ path: "/create-tag" })
  //   .input(z.object({ name: z.string().min(1), imgId: z.string().min(1) }))
  //   .handler(async ({ input }) => {
  //     const [tag] = await db
  //       .insert(schemas.tag)
  //       .values({ name: input.name })
  //       .onConflictDoUpdate({
  //         target: schemas.tag.name,
  //         set: { name: input.name },
  //       })
  //       .returning();
  //     if (!tag) {
  //       throw new Error("Failed to create tag");
  //     }
  //     const [imageTag] = await db
  //       .insert(schemas.imageTags)
  //       .values({
  //         tagId: tag.id,
  //         imageId: input.imgId,
  //         value: input.name,
  //       })
  //       .onConflictDoNothing()
  //       .returning();
  //     return { tag, imageTag };
  //   }),
  // deleteimage: protectedProcedure
  //   .route({ method: "DELETE", path: "/delete-image" })
  //   .input(z.object({ key: z.string().min(1), bucketId: z.string().min(1) }))
  //   .handler(async ({ input }) => {
  //     const [dbImg, r2img] = await Promise.all([
  //       db.query.image.findFirst({
  //         where: (f, o) =>
  //           o.and(
  //             o.eq(f.key, input.key),
  //             o.eq(f.orgId, input.bucketId),
  //           ),
  //         columns: { key: true, orgId: true, userId: true, id: true },
  //       }),
  //       env.IMAGES.head(input.key),
  //     ]);
  //     console.log("[IMAGE IN DB]:", dbImg);
  //     console.log("[IMAGE IN R2]: ", r2img?.key);
  //     const deleteImgPromise = [];
  //     if (dbImg) {
  //       deleteImgPromise.push(
  //         db
  //           .delete(schemas.image)
  //           .where(drizzle.eq(schemas.image.id, dbImg.id))
  //           .returning(),
  //       );
  //     }
  //     if (r2img) {
  //       deleteImgPromise.push(env.IMAGES.delete(input.key));
  //     }
  //     const isDeleted = (await Promise.allSettled(deleteImgPromise))
  //       .filter((pr) => pr.status === "fulfilled")
  //       .map((itm) => itm.value);
  //     console.log("[DELETED IMAGE]:", JSON.stringify(isDeleted, null, 2));
  //   }),
  // transformImage: protectedProcedure
  //   .route({ method: "POST", path: "/transform-image" })
  //   .input(transformationSchema)
  //   .handler(({ input }) => {
  //     console.log("[RECIVIED INPUT]:", input);
  //     return input;
  //   }),
};

const queries = {
  // getOriginalImages: protectedProcedure
  //   .route({ method: "GET", path: "/get-original-images" })
  //   .input(
  //     z.object({
  //       orgId: z.string().min(4),
  //       take: z.number().min(1).max(100).default(25).optional(),
  //       offset: z.number().min(0).default(0).optional(),
  //     }),
  //   )
  //   .handler(async ({ input }) => {
  //     const imgs = await db.query.image.findMany({
  //       where: (f, o) =>
  //         o.and(o.eq(f.orgId, input.orgId), o.eq(f.uploadingStatus, "success")),
  //       columns: { key: true, createdAt: true, userId: true, orgId: true },
  //     });
  //     const allDBImgsP = imgs.map((img) => ({
  //       ...img,
  //       url: `${env.BACKEND_URL}/${img.orgId}/${img.key}`,
  //     }));
  //     return allDBImgsP;
  //   }),
  // getTransformedImages: protectedProcedure
  //   .route({ method: "GET", path: "/get-transformed-images" })
  //   .input(
  //     z.object({
  //       orgId: z.string().min(4),
  //       take: z.number().min(1).max(100).default(25).optional(),
  //       offset: z.number().min(0).default(0).optional(),
  //     }),
  //   )
  //   .handler(async ({ input }) => {
  //     const imgs = await db.query.image.findMany({
  //       where: (f, o) =>
  //         o.and(o.eq(f.orgId, input.orgId), o.eq(f.uploadingStatus, "success")),
  //       columns: { key: true, createdAt: true, userId: true, orgId: true },
  //     });
  //     const allDBImgsP = imgs.map((img) => ({
  //       ...img,
  //       url: `${env.BACKEND_URL}/${img.orgId}/${img.key}`,
  //     }));
  //     return allDBImgsP;
  //   }),
  // getImage: protectedProcedure
  //   .route({ method: "GET", path: "/get-image" })
  //   .input(z.object({ bucketId: z.string().min(1), key: z.string().min(1) }))
  //   .handler(async ({ input, context }) => {
  //     console.log("[CONTROL REACHED]", context);
  //     const [img, allOrgTags] = await Promise.all([
  //       db.query.image.findFirst({
  //         where: (f, o) =>
  //           o.and(o.eq(f.orgId, input.bucketId), o.eq(f.key, input.key)),
  //         with: {
  //           metadata: true,
  //           imageTags: {
  //             with: {
  //               tag: true,
  //             },
  //           },
  //         },
  //       }),
  //       // Get all tags used in this organization
  //       db.query.tag.findMany({
  //         where: (t, o) =>
  //           o.inArray(
  //             t.id,
  //             db
  //               .selectDistinct({ tagId: schemas.imageTags.tagId })
  //               .from(schemas.imageTags)
  //               .innerJoin(
  //                 schemas.image,
  //                 drizzle.eq(schemas.imageTags.imageId, schemas.image.id),
  //               )
  //               .where(drizzle.eq(schemas.image.orgId, input.bucketId)),
  //           ),
  //       }),
  //     ]);
  //     console.log("[IMAGE metadata]: ", JSON.stringify(img?.metadata, null, 2));
  //     if (!img) {
  //       return null;
  //     }
  //     return {
  //       ...img,
  //       url: `${env.BACKEND_URL}/${input.bucketId}/${input.key}`,
  //       allOrgTags,
  //     };
  //   }),
  // getBucketStats: protectedProcedure
  //   .route({ path: "/get-org-stats", method: "GET" })
  //   .meta({ "description:": "Get an image for a specified bucket " })
  //   .input(z.object({ orgId: z.string() }))
  //   .handler(async ({ input }) => {
  //     const [memberCount, imageCount, transformedImageCount] =
  //       await Promise.all([
  //         db
  //           .select({ count: drizzle.count() })
  //           .from(schemas.member)
  //           .where(drizzle.eq(schemas.member.organizationId, input.orgId))
  //           .then((result) => result[0]?.count ?? 0),
  //         db
  //           .select({ count: drizzle.count() })
  //           .from(schemas.image)
  //           .where(drizzle.eq(schemas.image.orgId, input.orgId))
  //           .then((result) => result[0]?.count ?? 0),
  //         db
  //           .select({
  //             count: drizzle.countDistinct(schemas.transformation.imageId),
  //           })
  //           .from(schemas.transformation)
  //           .innerJoin(
  //             schemas.image,
  //             drizzle.eq(schemas.transformation.imageId, schemas.image.id),
  //           )
  //           .where(drizzle.eq(schemas.image.orgId, input.orgId))
  //           .then((result) => result[0]?.count ?? 0),
  //       ]);
  //     return {
  //       orgId: input.orgId,
  //       members: memberCount,
  //       images: imageCount,
  //       transformations: transformedImageCount,
  //     };
  //   }),
};
export const protectedRoutes = { mutations, queries };
