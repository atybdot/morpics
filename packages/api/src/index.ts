import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

import z from "zod";
import type { UsageMetricKey } from "@morpics/db/schema";

export const o = os.$context<Context>().errors({
  QUOTA_EXHAUST: {
    data: z.object({
      metric: z.custom<UsageMetricKey>(),
    }),
    status: 403,
  },
});

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
