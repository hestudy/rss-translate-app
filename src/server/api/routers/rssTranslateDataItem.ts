import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { rssTranslateDataItem } from "~/server/db/schema";
import { authProcedure, createTRPCRouter } from "../trpc";
import { rssTranslateDataItemQueue } from "~/server/queue/rssTranslateDataItem";

export const rssTranslateDataItemRouter = createTRPCRouter({
  list: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return Promise.all(
        (
          await db.query.rssTranslateDataItem.findMany({
            where: eq(rssTranslateDataItem.rssTranslateDataId, input.id),
          })
        ).map(async (d) => {
          return {
            ...d,
            jobState: d.jobId
              ? await rssTranslateDataItemQueue.getJobState(d.jobId)
              : null,
          };
        }),
      );
    }),
});
