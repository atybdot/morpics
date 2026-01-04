import { env } from "cloudflare:workers";
import { createContext } from "@morpics/api/context";
import { appRouter } from "@morpics/api/routers/index";
import { db } from "@morpics/db";
import { usageHelpers } from "@morpics/db/helpers/usage";
import * as tables from "@morpics/db/schema";
import type { UserTier } from "@morpics/db/schema/constants";
import { schema } from "@morpics/sdk";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign } from "hono/jwt";
import { logger } from "hono/logger";

import { prettyJSON } from "hono/pretty-json";
import { getOwner } from "./lib/utils";

const app = new Hono();

app.use(logger(), prettyJSON());
app.get("/favicon.ico", (c) =>
  c.redirect("https://mor.pics/favicon/favicon.ico"),
);
app.use(
  "/*",
  cors({
    origin: [
      env.FRONTEND_URL,
      env.BACKEND_URL,
      env.BETTER_AUTH_URL,
      env.FUNCTION_URL,
    ],
    allowMethods: ["*"],
    allowHeaders: ["Content-Type", "Authorization", "Cache-Control", "ETag", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  }),
);

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    if (env.NODE_ENV === "production") {
      return c.text("Unauthorized", 401);
    }

    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/:bucketSlug/:key", async (c) => {
  const { bucketSlug, key } = c.req.param();
  const queries = c.req.query();
  const parseQuery = schema.transformationQuerySchema.parse(queries);
  const searchParams = new URLSearchParams(
    Object.entries(parseQuery)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const newURL = new URL(env.BACKEND_URL);
  newURL.search = searchParams;
  newURL.pathname = `/${bucketSlug}/${key}`;

  const owner = await getOwner({ bucketSlug, key });
  const origin = c.req.header("Origin") ?? c.req.header("Referer") ?? "unknown";

  const bandwidthInc = !(
    origin.includes(env.FRONTEND_URL) || origin.includes(env.FUNCTION_URL)
  );

  if (!owner) {
    return c.json({ error: "Organization or owner not found" }, 404);
  }

  const usage = await Promise.all([
    usageHelpers.canUse({
      userId: owner.owner.userId as string,
      userTier: owner.user.activeTier as UserTier,
      metric: "transformations",
    }),
    usageHelpers.canUse({
      userId: owner.owner.userId as string,
      userTier: owner.user.activeTier as UserTier,
      metric: "cache",
    }),
    usageHelpers.canUse({
      userId: owner.owner.userId as string,
      userTier: owner.user.activeTier as UserTier,
      metric: "bandwidth",
    }),
  ]);

  if (!usage[2]) {
    return c.json({ error: "Bandwidth limit reached" }, 403);
  }

  if (!searchParams) {
    const img = await env.IMAGES.get(`${bucketSlug}/${key}`);
    if (img) {
      if (bandwidthInc) {
        c.executionCtx.waitUntil(
          usageHelpers.incrementMetric({
            userId: owner.owner.userId as string,
            metric: "bandwidth",
            value: img.size,
          }),
        );
      }
      return c.body(img.body, {
        headers: {
          "Content-Type": img.httpMetadata?.contentType as string,
          ETag: img.httpEtag,
          "Cache-Control":
            "public, max-age=3600, stale-while-revalidate=216000",
        },
      });
    }
    return c.notFound();
  }
  if (!usage[0]) {
    return c.json({ error: "Transformation limit reached" }, 403);
  }
  if (!usage[1]) {
    return c.json({ error: "Cache limit reached" }, 403);
  }

  const transformationQuery = await db.query.transformation.findFirst({
    where: (f, o) =>
      o.and(
        o.eq(f.key, key),
        o.eq(f.transformation_query, searchParams),
        o.eq(f.bucket, bucketSlug),
      ),
  });

  if (transformationQuery?.transformation_query) {
    const transformedImg = await env.IMAGES.get(
      `${bucketSlug}/${key}/${transformationQuery.transformation_query}`,
    );
    if (transformedImg) {
      if (bandwidthInc) {
        c.executionCtx.waitUntil(
          usageHelpers.incrementMetric({
            userId: owner.owner.userId as string,
            metric: "bandwidth",
            value: transformedImg.size,
          }),
        );
      }
      return c.body(transformedImg.body, {
        headers: {
          "Content-Type": transformedImg.httpMetadata?.contentType as string,
          ETag: transformedImg.httpEtag,
          "Cache-Control":
            "public, max-age=3600, stale-while-revalidate=216000",
        },
      });
    }
  }

  const jwtPayload = await sign(
    {
      iss: env.JWT_ISSUER,
      exp: Math.floor(Date.now() / 1000) + 1 * 60, // 1 minute from now
      bucket: bucketSlug,
      key: key,
      searchKey: searchParams,
    },
    env.JWT_SECRET,
  );

  const res = await fetch(`${env.FUNCTION_URL}`, {
    method: "POST",
    body: JSON.stringify({
      url: newURL.toString(),
    }),
    headers: {
      Authorization: `Bearer ${jwtPayload}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return c.json({ error: "unable to transform image" }, 505);
  }
  const file = Buffer.from(await res.arrayBuffer());
  await env.IMAGES.put(`${bucketSlug}/${key}/${searchParams}`, file, {
    httpMetadata: { contentType: `image/${parseQuery.format}` },
  }).then(async (img) => {
    await Promise.all([
      db
        .insert(tables.transformation)
        .values({
          bucket: bucketSlug,
          key: `${bucketSlug}/${key}`,
          imageId: owner.img.id as string,
          transformation_query: searchParams,
        })
        .onConflictDoNothing()
        .returning()
        .then(async (d) => {
          db.insert(tables.transformation_metadata)
            .values({
              fileSize: file.byteLength,
              mimetype: parseQuery?.format
                ? `image/${parseQuery.format}`
                : "image/jpeg",
              height: parseQuery.h as number,
              width: parseQuery.w as number,
              rotate: parseQuery.r as number,
              quality: parseQuery.quality as number,
              transformationId: d[0]?.id as string,
            })
            .returning()
            .then((tr) => {
              db.insert(tables.filters)
                .values({
                  blur: parseQuery.blur as number,
                  grayscale: parseQuery.grayscale as boolean,
                  transformationMetadataId: tr[0]?.id as string,
                })
                .returning();
            });
        }),
      usageHelpers.incrementMetric({
        userId: owner.owner.userId as string,
        metric: "transformations",
      }),
      usageHelpers.incrementMetric({
        userId: owner.owner.userId as string,
        metric: "cache",
        value: file.byteLength,
      }),
      usageHelpers.incrementMetric({
        userId: owner.owner.userId as string,
        metric: "bandwidth",
        value: file.byteLength,
      }),
    ]);

    return c.body(file, {
      headers: {
        Etag: img.httpEtag,
        "Content-Type": `image/${parseQuery.format}`,
        "Content-Length": String(file.byteLength),
        "Cache-Control":
          "public, max-age=31536000, stale-while-revalidate=216000",
      },
    });
  });

  return c.notFound();
});

// app.get("/test/:bucketSlug/:key", async (c) => {
//   const { bucketSlug, key } = c.req.param();

//   const queries = c.req.query();
//   const parseQuery = schema.transformationQuerySchema.parse(queries);
//   const searchParams = new URLSearchParams(
//     Object.entries(parseQuery)
//       .filter(([_, value]) => value !== undefined)
//       .map(([key, value]) => [key, String(value)]),
//   ).toString();

//   console.log("[SEARCH KEY]: ", searchParams);
//   const newURL = new URL(env.BACKEND_URL);
//   newURL.search = searchParams;
//   newURL.pathname = `/${bucketSlug}/${key}`;
//   console.log("[URL]:", newURL.toString());

//   const isInDb = await db.query.transformation.findFirst({
//     where: (f, o) =>
//       o.and(
//         o.eq(f.key, key),
//         o.eq(f.transformation_query, searchParams),
//         o.eq(f.bucket, bucketSlug),
//       ),
//     columns: { transformation_query: true },
//   });
//   const ownerQuery = db
//     .select({ userId: tables.member.userId })
//     .from(tables.member)
//     .where(drizzle.eq(tables.member.role, "owner"))
//     .limit(1)
//     .as("owner");
//   const imgQuery = db
//     .select()
//     .from(tables.image)
//     .where(
//       drizzle.and(
//         drizzle.eq(tables.image.bucket_slug, bucketSlug),
//         drizzle.eq(tables.image.key, key),
//       ),
//     )
//     .as("img");
//   const owner = await db
//     .select()
//     .from(tables.organization)
//     .where(drizzle.eq(tables.organization.slug, bucketSlug))
//     .crossJoin(ownerQuery)
//     .crossJoin(imgQuery)
//     .innerJoin(tables.user, drizzle.eq(ownerQuery.userId, tables.user.id));

//   if (owner.length === 0) {
//     return c.json({ error: "Organization or owner not found" }, 404);
//   }

//   if (!isInDb?.transformation_query) {
//     console.log("[NO TRANSFORMATION FOUND]");
//     const [transformations, cache] = await Promise.all([
//       usageHelpers.canUse({
//         userId: owner[0]?.owner.userId as string,
//         userTier: owner[0]?.user.activeTier as UserTier,
//         metric: "transformations",
//       }),
//       usageHelpers.canUse({
//         userId: owner[0]?.owner.userId as string,
//         userTier: owner[0]?.user.activeTier as UserTier,
//         metric: "cache",
//       }),
//     ]);
//     if (transformations && cache) {
//       const jwtPayload = await sign(
//         {
//           iss: env.JWT_ISSUER,
//           exp: Math.floor(Date.now() / 1000) + 1 * 60, // 1 minute from now
//           bucket: bucketSlug,
//           key: key,
//           searchKey: searchParams,
//         },
//         env.JWT_SECRET,
//       );
//       // return c.json({
//       //   jwt: jwtPayload,
//       //   search: searchParams,
//       //   url: newURL.toString(),
//       // });
//       console.log("[fetching function]");

//       const res = await fetch(`${env.FUNCTION_URL}/dev`, {
//         method: "POST",
//         body: JSON.stringify({
//           url: newURL.toString(),
//         }),
//         headers: {
//           Authorization: `Bearer ${jwtPayload}`,
//           "Content-Type": "application/json",
//         },
//       });
//       const file = Buffer.from(await res.arrayBuffer());
//       const [_, __] = await Promise.all([
//         db
//           .insert(tables.transformation)
//           .values({
//             bucket: bucketSlug,
//             key,
//             imageId: owner[0]?.img.id as string,
//             transformation_query: searchParams,
//           })
//           .returning(),
//         env.IMAGES.put(`${bucketSlug}/${key}/${searchParams}`, file),
//       ]);
//       return c.json({ status: "ok" }, 200);
//     }
//   }

//   const img = await env.IMAGES.get(`${bucketSlug}/${key}/${searchParams}`);
//   if (img) {
//     return c.body(img.body, {
//       headers: {
//         "Content-Type": img.httpMetadata?.contentType as string,
//         ETag: img.httpEtag,
//         // "Cache-Control": "public, max-age=3600, stale-while-revalidate=216000",
//       },
//     });
//   }
//   // return c.json({ bucketSlug, key, searchKey, searchParams: searchParams });
//   // return c.json({ isInDb });
// });

export default app;
