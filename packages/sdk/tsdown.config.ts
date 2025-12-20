import { defineConfig } from "tsdown";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  entry: ["src/index.ts", "src/transformationQuerySchema.json"],
  exports: true,
  external: [], // Bundle all dependencies
  env:{
    PUBLIC_API_ENDPOINT: process.env.PUBLIC_API_ENDPOINT!,
  }
});
