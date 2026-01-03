import { dodopaymentsClient } from "@dodopayments/better-auth";
import type { auth } from "@morpics/auth";
import {
  apiKeyClient,
  customSessionClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  multiSessionClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    customSessionClient<typeof auth>(),
    organizationClient({}),
    lastLoginMethodClient(),
    apiKeyClient(),
    multiSessionClient(),
    dodopaymentsClient(),
  ],
});
