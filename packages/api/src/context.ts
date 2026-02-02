import { auth } from "@morpics/auth";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  try {
    const session = await auth.api.getSession({
      headers: context.req.raw.headers,
    });

    // Debug logging - remove after testing
    if (!session) {
      console.log("[AUTH] No session found. Headers:", {
        cookie: context.req.raw.headers.get("cookie"),
        authorization: context.req.raw.headers.get("authorization"),
      });
    } else {
      console.log("[AUTH] Session found for user:", session.user?.id);
    }

    return {
      session,
    };
  } catch (error) {
    console.error("[AUTH] Error getting session:", error);
    return {
      session: null,
    };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
