import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssTranslateDataItem } from "~/server/db/schema";
import { authProcedure, createTRPCRouter } from "../trpc";

export const rssTranslateDataItemRouter = createTRPCRouter({
  list: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await db.query.rssTranslateDataItem.findMany({
        where: eq(rssTranslateDataItem.rssTranslateDataId, input.id),
      });
    }),
  delete: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .delete(rssTranslateDataItem)
        .where(eq(rssTranslateDataItem.id, input.id));
    }),
});
