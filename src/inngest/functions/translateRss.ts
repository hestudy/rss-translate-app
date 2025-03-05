import { eq, isNull } from "drizzle-orm";
import type Parser from "rss-parser";
import { db } from "~/server/db";
import { rssTranslate, rssTranslateDataItem } from "~/server/db/schema";
import { translate } from "~/utils/translate";
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
        return await db.query.rssTranslateDataItem.findMany({
          where: isNull(rssTranslateDataItem.data),
          with: {
            rssTranslateData: true,
          },
        });
      },
    );

    for (const item of noTranslateRssItemList) {
      const origin = item.origin as Parser.Item;
      const rssTranslateRecord = await step.run(
        `get rss translate config: ${item.link}`,
        async () => {
          return await db.query.rssTranslate.findFirst({
            where: eq(rssTranslate.id, item.rssTranslateData.rssTranslateId),
            with: {
              rssOriginData: true,
              translateOriginData: true,
              translatePromptData: true,
            },
          });
        },
      );

      if (rssTranslateRecord) {
        const title = await step.run(
          `translate rss title: ${origin.title}`,
          async () => {
            return await translate({
              apiKey: rssTranslateRecord.translateOriginData.apiKey ?? "",
              language: rssTranslateRecord.language ?? "",
              model: rssTranslateRecord.translateOriginData.model ?? "",
              prompt: rssTranslateRecord.translatePromptData.prompt ?? "",
              baseUrl: rssTranslateRecord.translateOriginData.baseUrl ?? "",
              content: origin.title,
            });
          },
        );

        const content = await step.run(
          `translate rss content: ${origin.content}`,
          async () => {
            return await translate({
              apiKey: rssTranslateRecord.translateOriginData.apiKey ?? "",
              language: rssTranslateRecord.language ?? "",
              model: rssTranslateRecord.translateOriginData.model ?? "",
              prompt: rssTranslateRecord.translatePromptData.prompt ?? "",
              baseUrl: rssTranslateRecord.translateOriginData.baseUrl ?? "",
              content: origin.content,
            });
          },
        );

        await step.run(`save translate rss: ${item.link}`, async () => {
          await db
            .update(rssTranslateDataItem)
            .set({
              data: {
                title,
                content,
              },
            })
            .where(eq(rssTranslateDataItem.id, item.id));
        });
      }
    }
  },
);
