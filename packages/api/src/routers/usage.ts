import z from "zod";
import { protectedProcedure } from "..";
import { USAGE_METRIC_KEYS } from "@morpics/db/schema/subscription";
import { usageHelpers } from "@morpics/db/helpers/usage";

export const usageRoutes = {
  update: protectedProcedure
    .route({
      method: "POST",
    })
    .input(
      z.object({
        usage: z
          .object({
            id: z.enum(USAGE_METRIC_KEYS),
            method: z.enum(["inc", "dec"]),
            value: z.number().min(1),
            orgId: z.string().optional(), // Required for seats operations
          })
          .array(),
      }),
    )
    .handler(async ({ input, context }) => {
      await Promise.all(
        input.usage.map(async (item) => {
          if (item.method === "inc") {
            return usageHelpers.incrementMetric({
              userId: context.session.user.id,
              metric: item.id,
              value: item.value,
              orgId: item.orgId,
            });
          }
          return usageHelpers.decrementMetric({
            userId: context.session.user.id,
            metric: item.id,
            value: item.value,
            orgId: item.orgId,
          });
        }),
      );
    }),
  get: protectedProcedure
    .route({
      method: "GET",
    })
    .handler(async ({ context }) => {
      return await usageHelpers.getUsage(context.session.user.id);
    }),
  check: protectedProcedure
    .route({ method: "GET" })
    .handler(async ({ context }) => {
      const userTier = context.session.user.activeTier ?? "free";

      return await usageHelpers.checkAllMetrics({
        userId: context.session.user.id,
        userTier,
      });
    }),
};
