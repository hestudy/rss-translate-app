import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssData } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const rssDataRouter = createTRPCRouter({
  page: protectedProcedure
    .input(
      z.object({
        current: z.number().min(1),
        pageSize: z.number(),
        rssOrigin: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      const list = await db.query.rssData.findMany({
        limit: input.pageSize,
        offset: (input.current - 1) * input.pageSize,
        where: eq(rssData.rssOriginId, input.rssOrigin),
        orderBy: (rssData, { desc }) => [desc(rssData.createdAt)],
      });
      const res = await db
        .select({
          count: count(),
        })
        .from(rssData)
        .where(eq(rssData.rssOriginId, input.rssOrigin));
      const total = res.at(0)?.count;

      return {
        list,
        total,
      };
    }),
});
