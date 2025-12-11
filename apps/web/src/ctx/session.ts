import type { authClient } from "@/lib/auth-client";
import { createContext } from "react";

export const sessionCtx = createContext<
  (typeof authClient.$Infer)["Session"] | null
>(null);
export type AuthSession = typeof authClient.$Infer["Session"]