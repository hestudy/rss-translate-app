import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { translateData } from "~/server/db/schema";
import { createTRPCRouter, authProcedure } from "../trpc";

export const rssDataRouter = createTRPCRouter({
  page: authProcedure
    .input(
      z.object({
        current: z.number().min(1),
        pageSize: z.number(),
        rssOrigin: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      const list = await db.query.translateData.findMany({
        limit: input.pageSize,
        offset: (input.current - 1) * input.pageSize,
        where: eq(translateData.rssOriginId, input.rssOrigin),
        orderBy: (rssData, { desc }) => [desc(rssData.createdAt)],
      });
      const res = await db
        .select({
          count: count(),
        })
        .from(translateData)
        .where(eq(translateData.rssOriginId, input.rssOrigin));
      const total = res.at(0)?.count;

      return {
        list,
        total,
      };
    }),
});
