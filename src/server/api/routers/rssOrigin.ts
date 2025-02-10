import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "~/server/db";
import { count } from "drizzle-orm";
import { rssOrigin } from "~/server/db/schema";

export const rssOriginRouter = createTRPCRouter({
  page: protectedProcedure
    .input(
      z.object({
        current: z.number(),
        pageSize: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const list = await db.query.rssOrigin.findMany({
        limit: input.pageSize,
        offset: (input.current - 1) * input.pageSize,
      });
      const total = await db.select({ count: count() }).from(rssOrigin);
    }),
});
