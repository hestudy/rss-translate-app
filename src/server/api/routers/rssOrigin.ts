import { count } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssOrigin } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { addRssOriginZObject } from "../schema/rssOrigin";

export const rssOriginRouter = createTRPCRouter({
  page: protectedProcedure
    .input(
      z.object({
        current: z.number(),
        pageSize: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const list = await db.query.rssOrigin.findMany({
        limit: input.pageSize,
        offset: (input.current - 1) * input.pageSize,
      });
      const res = await db.select({ count: count() }).from(rssOrigin);
      const total = res.at(0)?.count;
      return {
        list,
        total,
      };
    }),
  add: protectedProcedure
    .input(addRssOriginZObject)
    .mutation(async ({ input, ctx }) => {
      return await db.insert(rssOrigin).values({
        name: input.name,
        link: input.link,
        createdById: ctx.session.user.id,
      });
    }),
});
