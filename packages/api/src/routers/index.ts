import { type RouterClient } from "@orpc/server";
import { publicProcedure } from "../index";
import { bucketRoutes } from "./buckets";
import { imagesRoute } from "./images";
import { publicRoutes } from "./public";
import { transformationRoutes } from "./transformations";
import { usageRoutes } from "./usage";
export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  publicRoutes,
  usage: usageRoutes,
  images: imagesRoute,
  transformation: transformationRoutes,
  bucket: bucketRoutes,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
