import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssOrigin } from "~/server/db/schema";
import { addRssOriginZObject, editRssOriginZObject } from "../schema/rssOrigin";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
  edit: protectedProcedure
    .input(editRssOriginZObject)
    .mutation(async ({ input }) => {
      return await db
        .update(rssOrigin)
        .set({
          name: input.name,
          link: input.link,
        })
        .where(eq(rssOrigin.id, input.id));
    }),
  info: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await db.query.rssOrigin.findFirst({
        where: eq(rssOrigin.id, input.id),
      });
    }),
});
