import { eq, isNull } from "drizzle-orm";
import type Parser from "rss-parser";
import { db } from "~/server/db";
import { rssTranslate, rssTranslateDataItem } from "~/server/db/schema";
import { inngest } from "../client";
import { translate } from "./translate";

export const translateRss = inngest.createFunction(
  {
    id: "translate rss",
  },
  {
    cron: "TZ=Asia/Shanghai 30 * * * *",
  },
  async ({ step, runId }) => {
    const noTranslateRssItemList = await step.run(
      "get not translate rss item",
      async () => {
        return await db.query.rssTranslateDataItem.findMany({
          where: isNull(rssTranslateDataItem.data),
          with: {
            rssTranslateData: {
              with: {
                rssTranslate: true,
              },
            },
          },
        });
      },
    );

    const enableRssItemList = await step.run(
      "filter enable rss translate",
      async () => {
        return noTranslateRssItemList.filter(
          (d) => !!d.rssTranslateData.rssTranslate.enabled,
        );
      },
    );

    for (const item of enableRssItemList) {
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
        const title = await step.invoke(
          `translate rss title: ${origin.title}`,
          {
            function: translate,
            data: {
              apiKey: rssTranslateRecord.translateOriginData.apiKey ?? "",
              language: rssTranslateRecord.language ?? "",
              model: rssTranslateRecord.translateOriginData.model ?? "",
              prompt: rssTranslateRecord.translatePromptData.prompt ?? "",
              baseUrl: rssTranslateRecord.translateOriginData.baseUrl ?? "",
              content: origin.title,
            },
          },
        );

        let originContent = origin.content;

        if (
          rssTranslateRecord.scrapyFull &&
          rssTranslateRecord.firecrawlApiKey
        ) {
          originContent = origin.content;
        }

        const content = await step.invoke(
          `translate rss content: ${origin.content}`,
          {
            function: translate,
            data: {
              apiKey: rssTranslateRecord.translateOriginData.apiKey ?? "",
              language: rssTranslateRecord.language ?? "",
              model: rssTranslateRecord.translateOriginData.model ?? "",
              prompt: rssTranslateRecord.translatePromptData.prompt ?? "",
              baseUrl: rssTranslateRecord.translateOriginData.baseUrl ?? "",
              content: originContent,
            },
          },
        );

        await step.run(`save translate rss: ${item.link}`, async () => {
          await db
            .update(rssTranslateDataItem)
            .set({
              data: {
                ...origin,
                title,
                content,
              },
              jobId: runId,
            })
            .where(eq(rssTranslateDataItem.id, item.id));
        });
      }
    }
  },
);
