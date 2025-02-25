import { and, count, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssTranslateData } from "~/server/db/schema";
import { authProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const rssTranslateDataRouter = createTRPCRouter({
  page: authProcedure
    .input(
      z.object({
        current: z.number().min(1),
        pageSize: z.number(),
        rssTranslateId: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      const list = await db.query.rssTranslateData.findMany({
        limit: input.pageSize,
        offset: (input.current - 1) * input.pageSize,
        where: eq(rssTranslateData.rssTranslateId, input.rssTranslateId),
        orderBy: (rssData, { desc }) => [desc(rssData.createdAt)],
      });
      const res = await db
        .select({
          count: count(),
        })
        .from(rssTranslateData)
        .where(eq(rssTranslateData.rssTranslateId, input.rssTranslateId));
      const total = res.at(0)?.count;

      return {
        list,
        total,
      };
    }),
  lastActive: publicProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return (
        await db
          .select()
          .from(rssTranslateData)
          .where(
            and(
              isNotNull(rssTranslateData.data),
              eq(rssTranslateData.rssTranslateId, input.id),
            ),
          )
          .orderBy(desc(rssTranslateData.createdAt))
      ).at(0);
    }),
});
