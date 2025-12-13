import { defineConfig } from "tsdown";

export default defineConfig({
  exports: true,
  external: [], // Bundle all dependencies
  // ...config options
});
