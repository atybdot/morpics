// instrumentation-client.js
import posthog from "posthog-js";
import { env } from "./env";

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: env.NEXT_PUBLIC_POSTHOG_PROXY,
  ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2025-11-30",
});
