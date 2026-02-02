import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { headers as baseHeaders } from "next/headers";
import { authClient } from "./auth-client";
export async function checkSession({ headers }: { headers?: () => Promise<ReadonlyHeaders> }) {
  const dh = headers ? headers : baseHeaders;
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await dh() },
  });
  return { hasSession: !!session, session };
}
