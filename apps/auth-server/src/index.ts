import { env } from "cloudflare:workers";
import { auth } from "@morpics/auth";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [env.BACKEND_URL, env.FRONTEND_URL],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.all("/success", (c) => {
  return c.redirect(`${env.FRONTEND_URL}/dashboard`);
});

export default app;
