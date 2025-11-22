import type { auth } from "@morpics/auth";
import {
  apiKeyClient,
  inferAdditionalFields,
  multiSessionClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({}),
    apiKeyClient(),
    multiSessionClient(),
  ],
});
