import { eq, isNull } from "drizzle-orm";
import type Parser from "rss-parser";
import { db } from "~/server/db";
import { rssTranslate, rssTranslateDataItem } from "~/server/db/schema";
import { inngest } from "../client";
import { firecrawlScrapy } from "./firecrawlScrapy";
import { mdToHtml } from "./mdToHtml";
import { rssScrapy } from "./rssScrapy";
import { translate } from "./translate";

export const translateRss = inngest.createFunction(
  {
    id: "translate rss",
    concurrency: 1,
  },
  {
    cron: "TZ=Asia/Shanghai 30 * * * *",
  },
  async ({ step, runId, logger }) => {
    const noTranslateRssItemList = await db.query.rssTranslateDataItem.findMany(
      {
        where: isNull(rssTranslateDataItem.data),
        with: {
          rssTranslateData: {
            with: {
              rssTranslate: true,
            },
          },
        },
      },
    );

    logger.info(
      `no translate rss item count: ${noTranslateRssItemList.length}`,
    );

    const enableRssItemList = noTranslateRssItemList.filter(
      (d) => !!d.rssTranslateData.rssTranslate.enabled,
    );

    logger.info(`enable rss item count: ${enableRssItemList.length}`);

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

        if (rssTranslateRecord.scrapyFull) {
          if (item.fullContent) {
            originContent = item.fullContent;
          } else {
            if (rssTranslateRecord.firecrawlApiKey) {
              originContent = await step.invoke(
                `use firecrawl scrapy rss: ${item.link}`,
                {
                  function: firecrawlScrapy,
                  data: {
                    url: item.link,
                    apikey: rssTranslateRecord.firecrawlApiKey,
                  },
                },
              );
            } else {
              originContent = await step.invoke(`scrapy rss: ${item.link}`, {
                function: rssScrapy,
                data: {
                  url: item.link,
                },
              });
            }

            await step.run(`save full content: ${item.link}`, async () => {
              await db
                .update(rssTranslateDataItem)
                .set({
                  fullContent: originContent,
                  jobId: runId,
                })
                .where(eq(rssTranslateDataItem.id, item.id));
            });
          }
        }

        let content = await step.invoke(
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
        if (rssTranslateRecord.scrapyFull && content) {
          content = await step.invoke("md to html", {
            function: mdToHtml,
            data: {
              content,
            },
          });
        }

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
