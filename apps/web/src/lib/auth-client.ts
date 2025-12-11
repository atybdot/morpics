import type { auth } from "@morpics/auth";
import {
  apiKeyClient,
  inferAdditionalFields,
  multiSessionClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({}),
    apiKeyClient(),
    multiSessionClient(),
    dodopaymentsClient(),
  ],
});
