import { Hono } from "hono";

const app = new Hono();

const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

app.all("/static/*", async (c) => {
  const url = new URL(c.req.url);
  const pathWithParams = url.pathname + url.search;

  const cache = caches.default;
  const cacheKey = new Request(`https://${ASSET_HOST}${pathWithParams}`);

  let response = await cache.match(cacheKey);
  if (!response) {
    response = await fetch(`https://${ASSET_HOST}${pathWithParams}`);
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
});

app.all("*", async (c) => {
  const url = new URL(c.req.url);
  const pathWithParams = url.pathname + url.search;

  const ip = c.req.header("CF-Connecting-IP") || "";
  const originHeaders = new Headers(c.req.raw.headers);
  originHeaders.delete("cookie");
  originHeaders.set("X-Forwarded-For", ip);

  const originRequest = new Request(`https://${API_HOST}${pathWithParams}`, {
    method: c.req.method,
    headers: originHeaders,
    body: c.req.raw.body,
    redirect: "manual",
  });

  return await fetch(originRequest);
});

export default app;
