import FirecrawlApp from "@mendable/firecrawl-js";
import { Queue, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { type User } from "next-auth";
import type { Item } from "rss-parser";
import { env } from "~/env";
import { type api } from "~/trpc/server";
import { translate } from "~/utils/translate";
import { db } from "../db";
import { rssTranslateDataItem } from "../db/schema";

export const rssTranslateDataItemQueue = new Queue("rssTranslateDataItem", {
  connection: {
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: 1000 * 60 * 5,
  },
});

const worker = new Worker<{
  rssTranslateDataItem: typeof rssTranslateDataItem.$inferSelect;
  rssTranslate: Awaited<ReturnType<typeof api.rssTranslate.detail>>;
  item: Item;
  user: User;
}>(
  "rssTranslateDataItem",
  async (job) => {
    const data = job.data;

    const record = await db.query.rssTranslateDataItem.findFirst({
      where: eq(rssTranslateDataItem.link, data.item.link ?? ""),
    });
    if (record?.data) {
      await db
        .update(rssTranslateDataItem)
        .set({
          data: {
            ...data.item,
            title: (record.data as any)?.title,
            content: (record.data as any)?.content,
          },
        })
        .where(eq(rssTranslateDataItem.id, data.rssTranslateDataItem.id));
      return;
    }

    const title = await translate({
      apiKey: data.rssTranslate?.translateOrigin?.apiKey ?? "",
      language: data.rssTranslate?.rssTranslate?.language ?? "",
      prompt: data.rssTranslate?.translatePrompt?.prompt ?? "",
      baseUrl: data.rssTranslate?.translateOrigin?.baseUrl ?? "",
      model: data.rssTranslate?.translateOrigin?.model ?? "",
      content: data.item.title ?? "",
    });

    let feedContent = "";

    if (
      data.rssTranslate?.rssTranslate.scrapyFull &&
      data.rssTranslate.rssTranslate.firecrawlApiKey
    ) {
      const firecrawl = new FirecrawlApp({
        apiKey: data.rssTranslate.rssTranslate.firecrawlApiKey,
      });
      const res = await firecrawl.scrapeUrl(data.item.link ?? "", {
        formats: ["markdown"],
      });
      if (res.success) {
        feedContent = res.markdown ?? "";
      }
    } else {
      feedContent = data.item.content ?? "";
    }

    const content = await translate({
      apiKey: data.rssTranslate?.translateOrigin?.apiKey ?? "",
      language: data.rssTranslate?.rssTranslate?.language ?? "",
      prompt: data.rssTranslate?.translatePrompt?.prompt ?? "",
      baseUrl: data.rssTranslate?.translateOrigin?.baseUrl ?? "",
      model: data.rssTranslate?.translateOrigin?.model ?? "",
      content: feedContent,
    });

    await db
      .update(rssTranslateDataItem)
      .set({
        data: {
          ...data.item,
          title,
          content,
        },
      })
      .where(eq(rssTranslateDataItem.id, data.rssTranslateDataItem.id));
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);

worker.on("progress", (job) => {
  console.log(`${job.id} has progress ${job.progress.toString()}`);
});

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
