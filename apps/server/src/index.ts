import { env } from "cloudflare:workers";
import { createContext } from "@morpics/api/context";
import { appRouter } from "@morpics/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [env.FRONTEND_URL, env.BACKEND_URL, env.BETTER_AUTH_URL,env.FUNCTION_URL],
    allowMethods: ["*"],
    allowHeaders: ["Content-Type", "Authorization", "Cache-Control", "ETag"],
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
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});
app.get("/:bucketId/:key", async (c) => {
  const { bucketId, key } = c.req.param();
  const img = await env.IMAGES.get(key);
  if (img) {
    return c.body(img.body, {
      headers: {
        "Content-Type": img.httpMetadata?.contentType as string,
        ETag: img.httpEtag,
        "Cache-Control": "public, max-age=60, stale-while-revalidate=3600",
      },
    });
  }
  return c.notFound();
});

export default app;
