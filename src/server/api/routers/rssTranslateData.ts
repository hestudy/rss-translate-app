import { asc, count, eq } from "drizzle-orm";
import { uniqWith } from "lodash";
import { z } from "zod";
import { db } from "~/server/db";
import {
  rssTranslate,
  rssTranslateData,
  rssTranslateDataItem,
} from "~/server/db/schema";
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
      return uniqWith(
        (
          await db
            .select()
            .from(rssTranslate)
            .where(eq(rssTranslate.id, input.id))
            .leftJoin(
              rssTranslateData,
              eq(rssTranslate.id, rssTranslateData.rssTranslateId),
            )
            .leftJoin(
              rssTranslateDataItem,
              eq(rssTranslateData.id, rssTranslateDataItem.rssTranslateDataId),
            )
            .orderBy(asc(rssTranslateDataItem.createdAt))
        ).filter((item) => {
          return !!item.rssTranslateDataItem?.data;
        }),
        (x, y) => x.rssTranslateDataItem?.link === y.rssTranslateDataItem?.link,
      );
    }),
});
