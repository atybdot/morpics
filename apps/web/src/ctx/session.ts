import { createContext } from "react";
import type { authClient } from "@/lib/auth-client";

export const sessionCtx = createContext<(typeof authClient.$Infer)["Session"] | null>(null);
export type AuthSession = (typeof authClient.$Infer)["Session"];
