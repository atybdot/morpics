import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    JWT_SECRET: z.string().min(1),
    JWT_ISSUER: z.string().min(1),
    BACKEND_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
});
