import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { rssDataRouter } from "./routers/rssData";
import { rssOriginRouter } from "./routers/rssOrigin";
import { rssTranslateRouter } from "./routers/rssTranslate";
import { translateOriginRouter } from "./routers/translateOrigin";
import { translatePromptRouter } from "./routers/translatePrompt";
import { rssTranslateDataRouter } from "./routers/rssTranslateData";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  rssOrigin: rssOriginRouter,
  rssData: rssDataRouter,
  translateOrigin: translateOriginRouter,
  translatePrompt: translatePromptRouter,
  rssTranslate: rssTranslateRouter,
  rssTranslateData: rssTranslateDataRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
