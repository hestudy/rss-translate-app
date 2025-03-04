import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  newRssTranslateData,
  newRssTranslateDataItem,
} from "~/server/db/schema";
import { fetchFeed } from "~/utils/fetchFeed";
import { inngest } from "../client";

export const fetchRssAndSaveRss = inngest.createFunction(
  {
    id: "fetch rss and save rss data",
  },
  {
    cron: "TZ=Asia/Shanghai 0 * * * *",
  },
  async ({ step }) => {
    const rssTranslateList = await step.run(
      "get all rss translate list",
      async () => {
        return await db.query.rssTranslate.findMany({
          with: {
            rssOriginData: true,
            translateOriginData: true,
            translatePromptData: true,
          },
        });
      },
    );
    for (const item of rssTranslateList) {
      const feed = await step.run(
        `fetch rss ${item.rssOriginData.link}`,
        async () => {
          return await fetchFeed(item.rssOriginData.link);
        },
      );

      const newRssTranslateDataResult = await step.run(
        `save rss data: ${feed.title}`,
        async () => {
          return (
            await db
              .insert(newRssTranslateData)
              .values({
                rssTranslateId: item.id,
                feed,
              })
              .returning()
          ).at(0);
        },
      );

      if (newRssTranslateDataResult?.id) {
        for (const rssItem of feed.items) {
          await step.run(`save rss item: ${rssItem.title}`, async () => {
            const rssItemRecord =
              await db.query.newRssTranslateDataItem.findFirst({
                where: eq(newRssTranslateDataItem.link, rssItem.link ?? ""),
              });
            if (!rssItemRecord) {
              await db.insert(newRssTranslateDataItem).values({
                newRssTranslateDataId: newRssTranslateDataResult?.id,
                link: rssItem.link ?? "",
                origin: rssItem,
              });
            }
          });
        }
      }
    }
  },
);
