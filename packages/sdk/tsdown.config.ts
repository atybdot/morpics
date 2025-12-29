import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/transformationQuerySchema.json"],
  exports: true,
  external: [], // Bundle all dependencies
});
