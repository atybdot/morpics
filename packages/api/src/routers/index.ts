import { type RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { publicRoutes } from "./public";
import { usageRoutes } from "./usage";
import { imagesRoute } from "./images";
import { bucketRoutes } from "./buckets";
import { transformationRoutes } from "./transformations";
export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  publicRoutes,
  usage: usageRoutes,
  images: imagesRoute,
  transformation: transformationRoutes,
  bucket: bucketRoutes,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
