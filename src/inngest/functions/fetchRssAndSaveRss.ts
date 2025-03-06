import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  rssTranslate,
  rssTranslateData,
  rssTranslateDataItem,
} from "~/server/db/schema";
import { inngest } from "../client";
import { fetchFeed } from "./fetchFeed";

export const fetchRssAndSaveRss = inngest.createFunction(
  {
    id: "fetch rss and save rss data",
  },
  {
    cron: "TZ=Asia/Shanghai 0 * * * *",
  },
  async ({ step, runId, logger }) => {
    const enableRssTranslateList = await db.query.rssTranslate.findMany({
      with: {
        rssOriginData: true,
        translateOriginData: true,
        translatePromptData: true,
      },
      where: eq(rssTranslate.enabled, true),
    });

    logger.info(`enable rss translate count: ${enableRssTranslateList.length}`);

    for (const item of enableRssTranslateList) {
      const feed = await step.invoke(`fetch rss ${item.rssOriginData.link}`, {
        function: fetchFeed,
        data: {
          url: item.rssOriginData.link,
        },
      });

      const rssTranslateDataResult = await step.run(
        `save rss data: ${feed.title}`,
        async () => {
          const record = (
            await db
              .insert(rssTranslateData)
              .values({
                rssTranslateId: item.id,
                feed,
                jobId: runId,
              })
              .returning()
          ).at(0);
          if (record) {
            const { feed, ...props } = record;
            return props;
          }
        },
      );

      if (rssTranslateDataResult?.id) {
        for (const rssItem of feed.items) {
          await step.run(`save rss item: ${rssItem.title}`, async () => {
            const rssItemRecord = await db.query.rssTranslateDataItem.findFirst(
              {
                where: eq(rssTranslateDataItem.link, rssItem.link ?? ""),
              },
            );
            if (!rssItemRecord) {
              await db.insert(rssTranslateDataItem).values({
                rssTranslateDataId: rssTranslateDataResult?.id,
                link: rssItem.link ?? "",
                origin: rssItem,
                jobId: runId,
              });
            }
          });
        }
      }
    }
  },
);
