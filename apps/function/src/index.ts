import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import sharp from "sharp";
import z from "zod";
import { transformationQuerySchema } from "@morpics/sdk";
import { jwt, type JwtVariables } from "hono/jwt";
import { env } from "../env.js";
import { cors } from "hono/cors";

type Variables = JwtVariables;
const app = new Hono<{ Variables: Variables }>();
app.use(
  "*",
  cors({
    origin: env.BACKEND_URL,
    allowMethods: ["POST"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
    credentials: true,
  }),
);
app.use(
  "*",
  jwt({
    secret: env.JWT_SECRET,
    verification: {
      iss: env.JWT_ISSUER,
    },
  }),
);

app.post("/", zValidator("json", z.object({ url: z.url() })), async (c) => {
  const { url: body } = c.req.valid("json");
  const url = new URL(body);
  const transformationOpts = Object.fromEntries(url.searchParams.entries());
  url.search = "";
  const { data: params, error } =
    transformationQuerySchema.safeParse(transformationOpts);
  if (!params || error) {
    console.log("validation falied");
    return c.json({ error: "validation failed", message: error }, 400);
  }
  // Fetch image from URL
  let imageBuffer: Buffer;
  try {
    imageBuffer = await getImageFromUrl(url.href);
  } catch (err) {
    console.error("Fetching failed");
    return c.json(
      {
        error: "unable to fetch image",
        message: err,
      },
      500,
    );
  }

  // Initialize Sharp with the image buffer
  let sharpInstance = sharp(imageBuffer);

  if (params.keepMetadata) {
    sharpInstance = sharpInstance.keepMetadata();
  }
  sharpInstance = sharpInstance.resize({
    width: params.w,
    height: params.h,
    fit: params.fit,
    position: params.position,
  });
  if (params.blur) {
    sharpInstance.blur(params.blur);
  }
  if (params.grayscale) {
    sharpInstance.grayscale(params.grayscale);
  }
  // Convert format if specified
  if (params.format) {
    sharpInstance = sharpInstance.toFormat(params.format, {
      quality: params.quality,
    });
  }

  // // Process the image
  const transformedImage = await sharpInstance.toBuffer();
  const headers = new Headers();
  headers.append("Content-Type", `image/${params.format}`);
  headers.append("Cache-Control", "public, max-age=31536000");
  if (params.h) {
    headers.append("x-height", params.h.toString());
  }

  if (params.w) {
    headers.append("x-width", params.w.toString());
  }
  // Return the transformed image
  return new Response(new Uint8Array(transformedImage), {
    status: 200,
    headers,
  });
});

export default app;

/**
 * Fetches an image from a URL
 */
async function getImageFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
