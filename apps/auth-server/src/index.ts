import { env } from "cloudflare:workers";
import { auth } from "@morpics/auth";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.get("/favicon.ico", (c) => c.redirect("https://mor.pics/favicon/favicon.ico"));
app.use(
  "/*",
  cors({
    origin: [env.BACKEND_URL, env.FRONTEND_URL, "http://localhost:3001", "http://localhost:3002"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.all("/", (c) => c.text("OK"));
app.all("/health", (c) => c.text("OK"));
app.all("/success", (c) => {
  console.log("[SUCCESS URL]:", c.req.raw.url);

  return c.redirect(`${env.FRONTEND_URL}/dashboard`);
});

export default app;
