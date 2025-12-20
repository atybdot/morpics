import z from "zod";
import { protectedProcedure } from "..";
import { usageHelpers } from "@morpics/db/helpers/usage";
import { db } from "@morpics/db";
import * as schema from "@morpics/db/schema";
import { r2Client } from "@morpics/buckets/server";
import { env } from "cloudflare:workers";
import { generatePresingedURL } from "@morpics/buckets/utils";

import { drizzle } from "@morpics/db/dirzzle";
import { imageInfoSchema, updateInfoSchema } from "../schemas";
import type { UserTier } from "@morpics/db/schema/constants";

const mutations = {
  getPreSignedUrl: protectedProcedure
    .route({
      path: "/image/singed-url",
    })
    .input(
      z.object({
        keys: z.string().array(),
        bucket: z.string("bucket name"),
        bucketId: z.string("bucket id"),
      }),
    )
    .handler(async ({ input, context: { session }, errors }) => {
      const canUploadImage = await usageHelpers.canUse({
        userId: session.user.id,
        userTier: session.user.activeTier as UserTier,
        metric: "storage",
      });
      if (!canUploadImage) {
        throw errors.QUOTA_EXHAUST({ data: { metric: "storage" } });
      }
      try {
        const createImagesPromises = await Promise.allSettled(
          input.keys.map((key) => {
            return db
              .insert(schema.image)
              .values({
                key: `${input.bucket}/${key}`,
                userId: session.user.id,
                orgId: input.bucketId,
                uploadingStatus: "pending",
              })
              .onConflictDoUpdate({
                target: schema.image.key,
                set: { key },
              })
              .returning();
          }),
        );
        const imagesCreated = createImagesPromises
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value[0]);

        if (imagesCreated.length === 0) {
          throw new Error("Failed to create any images");
        }

        const { urls: singedURL } = await generatePresingedURL({
          metadata: { orgId: input.bucket, userId: session.user.id },
          keys: imagesCreated.map((img) => img?.key) as string[],
          client: r2Client,
          bucketName: env.R2_BUCKET_NAME,
        });

        return singedURL;
      } catch (error) {
        throw error;
      }
    }),

  "update-status": protectedProcedure
    .route({ method: "PATCH", path: "/image/status" })
    .input(
      z.object({
        imageKey: z.string().min(1),
        status: z.enum(schema.imageStatusEnum.enumValues),
        size: z.number().min(1),
      }),
    )
    .handler(async ({ input: { imageKey: key, status, size }, context }) => {
      if (status === "failed") {
        const [delImg, _] = await Promise.all([
          db
            .delete(schema.image)
            .where(drizzle.eq(schema.image.key, key))
            .returning(),
          usageHelpers.decrementMetric({
            userId: context.session.user.id,
            metric: "storage",
            value: size,
          }),
        ]);
        return delImg;
      }
      if (status === "success") {
        const [updImg, _] = await Promise.all([
          db
            .update(schema.image)
            .set({ uploadingStatus: status })
            .where(drizzle.eq(schema.image.key, key))
            .returning(),
          usageHelpers.incrementMetric({
            userId: context.session.user.id,
            metric: "storage",
            value: size,
          }),
        ]);
        return updImg;
      }
      return await db
        .update(schema.image)
        .set({ uploadingStatus: status })
        .where(drizzle.eq(schema.image.key, key))
        .returning();
    }),

  updateInfo: protectedProcedure
    .route({ method: "PATCH", path: "/image/info" })
    .input(updateInfoSchema)
    .handler(async ({ input: { altTxt, tags, ...restInput } }) => {
      const metadataUpdate = await db
        .update(schema.metadata)
        .set({
          altText: altTxt,
          ...restInput,
        })
        .where(drizzle.eq(schema.metadata.imageId, restInput.imgId))
        .returning();

      if (restInput.key) {
        const newKey = restInput.key;
        await db.query.image
          .findFirst({ where: (f) => drizzle.eq(f.id, restInput.imgId) })
          .then(async (res) => {
            const r2Old = await env.IMAGES.get(res?.key as string);
            if (r2Old) {
              await env.IMAGES.put(newKey, r2Old.body, {
                httpMetadata: r2Old.httpMetadata,
                customMetadata: r2Old.customMetadata,
              });
            }
          });
        await db
          .update(schema.image)
          .set({ key: restInput.key })
          .where(drizzle.eq(schema.image.id, restInput.imgId));
      }

      // Handle tags: delete all existing and insert new ones
      if (tags !== undefined) {
        await db
          .delete(schema.imageTags)
          .where(drizzle.eq(schema.imageTags.imageId, restInput.imgId));

        if (tags.length > 0) {
          const tagValues = tags.map((tag) => ({
            imageId: restInput.imgId,
            tagId: tag.id,
            value: tag.value,
          }));

          await db
            .insert(schema.imageTags)
            .values(tagValues)
            .onConflictDoNothing();
        }
      }

      return metadataUpdate;
    }),

  createInfo: protectedProcedure
    .route({ path: "/image/info" })
    .input(imageInfoSchema)
    .handler(async ({ input }) => {
      return db
        .insert(schema.metadata)
        .values({
          ...input,
        })
        .onConflictDoUpdate({ target: schema.metadata.id, set: { ...input } })
        .returning();
    }),
  createTag: protectedProcedure
    .route({ path: "/image/info/tag" })
    .input(z.object({ name: z.string().min(1), imgId: z.string().min(1) }))
    .handler(async ({ input }) => {
      const [tag] = await db
        .insert(schema.tag)
        .values({ name: input.name })
        .onConflictDoUpdate({
          target: schema.tag.name,
          set: { name: input.name },
        })
        .returning();

      if (!tag) {
        throw new Error("Failed to create tag");
      }

      const [imageTag] = await db
        .insert(schema.imageTags)
        .values({
          tagId: tag.id,
          imageId: input.imgId,
          value: input.name,
        })
        .onConflictDoNothing()
        .returning();

      return { tag, imageTag };
    }),
  delete: protectedProcedure
    .route({ method: "DELETE", path: "/image" })
    .input(z.object({ key: z.string().min(1), bucketId: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const [dbImg, r2img] = await Promise.all([
        db.query.image.findFirst({
          where: (f, o) =>
            o.and(
              o.eq(f.key, input.key),

              o.eq(f.orgId, input.bucketId),
            ),
          columns: { key: true, orgId: true, userId: true, id: true },
        }),
        env.IMAGES.head(input.key),
      ]);

      const deleteImgPromise = [];
      if (dbImg) {
        deleteImgPromise.push(
          db
            .delete(schema.image)
            .where(drizzle.eq(schema.image.id, dbImg.id))
            .returning(),
        );
      }
      if (r2img) {
        deleteImgPromise.push(
          usageHelpers.decrementMetric({
            userId: context.session.user.id,
            metric: "storage",
            value: r2img.size,
          }),
        );
        deleteImgPromise.push(env.IMAGES.delete(input.key));
      }

      return (await Promise.allSettled(deleteImgPromise))
        .filter((pr) => pr.status === "fulfilled")
        .map((itm) => itm.value);
    }),
};

const queries = {
  all: protectedProcedure
    .route({ method: "GET", path: "/image/all" })
    .input(
      z.object({
        bucketId: z.string().min(1),
        bucket: z.string().min(1),
        take: z.number().min(1).max(100).default(25).optional(),

        offset: z.number().min(0).default(0).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const imgs = await db.query.image.findMany({
        where: (f, o) =>
          o.and(o.eq(f.orgId, input.bucketId), o.eq(f.uploadingStatus, "success")),
        columns: { key: true, createdAt: true, userId: true, orgId: true },
      });
      const allDBImgsP = imgs.map((img) => ({
        ...img,

        url: `${env.BACKEND_URL}/${input.bucket}/${img.key}`,
      }));

      return allDBImgsP;
    }),
  get: protectedProcedure
    .route({ method: "GET", path: "/image" })
    .input(
      z.object({
        bucketId: z.string().min(1),
        key: z.string().min(1),
        bucket: z.string().min(1),
      }),
    )
    .handler(async ({ input }) => {
      const [img, allOrgTags] = await Promise.all([
        db.query.image.findFirst({
          where: (f, o) =>
            o.and(o.eq(f.orgId, input.bucketId), o.eq(f.key, input.key)),
          with: {
            metadata: true,
            imageTags: {
              with: {
                tag: true,
              },
            },
          },
        }),
        // Get all tags used in this organization
        db.query.tag.findMany({
          where: (t, o) =>
            o.inArray(
              t.id,
              db
                .selectDistinct({ tagId: schema.imageTags.tagId })
                .from(schema.imageTags)
                .innerJoin(
                  schema.image,
                  drizzle.eq(schema.imageTags.imageId, schema.image.id),
                )
                .where(drizzle.eq(schema.image.orgId, input.bucketId)),
            ),
        }),
      ]);
      if (!img) {
        return null;
      }

      return {
        ...img,
        url: `${env.BACKEND_URL}/${input.bucket}/${input.key}`,
        allOrgTags,
      };
    }),
};

export const imagesRoute = { ...mutations, ...queries };
