import { isNull } from "drizzle-orm";
import { db } from "~/server/db";
import { newRssTranslateDataItem } from "~/server/db/schema";
import { inngest } from "../client";

export const translateRss = inngest.createFunction(
  {
    id: "translate rss",
  },
  {
    cron: "TZ=Asia/Shanghai 30 * * * *",
  },
  async ({ step }) => {
    const noTranslateRssItemList = await step.run(
      "get not translate rss item",
      async () => {
        return await db.query.newRssTranslateDataItem.findMany({
          where: isNull(newRssTranslateDataItem.data),
          with: {
            newRssTranslateData: {
              with: {
                rssTranslate: {
                  with: {
                    translateOriginData: true,
                    rssOriginData: true,
                  },
                },
              },
            },
          },
        });
      },
    );
  },
);
