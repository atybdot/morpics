import { headers } from "next/headers";
import { authClient } from "./auth-client";
export async function checkSession() {
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  return !!session;
}
