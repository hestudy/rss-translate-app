import { Queue, Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { type User } from "next-auth";
import Parser from "rss-parser";
import { env } from "~/env";
import { type api } from "~/trpc/server";
import { translate } from "~/utils/translate";
import { db } from "../db";
import { rssTranslate, rssTranslateData } from "../db/schema";

const parser = new Parser();

export const rssTranslateQueue = new Queue("rssTranslate", {
  connection: {
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: 1000 * 60 * 5,
  },
});

const worker = new Worker<{
  rssTranslate: Awaited<ReturnType<typeof api.rssTranslate.detail>>;
  user: User;
}>(
  "rssTranslate",
  async (job) => {
    const feed = await parser.parseURL(
      job.data.rssTranslate?.rssOrigin?.link ?? "",
    );
    const result = await db
      .insert(rssTranslateData)
      .values({
        rssTranslateId: job.data.rssTranslate?.rssTranslate.id ?? "",
        jobId: job.id,
        jobStatus: await job.getState(),
        feed,
        createdById: job.data.user.id!,
      })
      .returning();
    const list: (typeof feed)["items"] = [];
    for (const item of feed.items) {
      const title = await translate({
        content: item.title ?? "",
        apiKey: job.data.rssTranslate?.translateOrigin?.apiKey ?? "",
        baseUrl: job.data.rssTranslate?.translateOrigin?.baseUrl ?? "",
        model: job.data.rssTranslate?.translateOrigin?.model ?? "",
        language: job.data.rssTranslate?.rssTranslate?.language ?? "",
        prompt: job.data.rssTranslate?.translatePrompt?.prompt ?? "",
      });
      const content = await translate({
        content: item.content ?? "",
        apiKey: job.data.rssTranslate?.translateOrigin?.apiKey ?? "",
        baseUrl: job.data.rssTranslate?.translateOrigin?.baseUrl ?? "",
        model: job.data.rssTranslate?.translateOrigin?.model ?? "",
        language: job.data.rssTranslate?.rssTranslate?.language ?? "",
        prompt: job.data.rssTranslate?.translatePrompt?.prompt ?? "",
      });
      list.push({
        ...item,
        title,
        content,
      });
    }
    await db
      .update(rssTranslateData)
      .set({
        data: {
          ...feed,
          items: list,
        },
      })
      .where(eq(rssTranslateData.id, result[0]!.id));
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);

worker.on("progress", (job) => {
  console.log(`${job.id} has progress ${job.progress.toString()}`);
  db.update(rssTranslate)
    .set({
      jobStatus: "progress",
    })
    .where(
      and(
        eq(rssTranslate.id, job.data.rssTranslate?.rssTranslate.id ?? ""),
        eq(rssTranslate.jobId, job.id ?? ""),
      ),
    );
});

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
  db.update(rssTranslate)
    .set({
      jobStatus: "completed",
    })
    .where(
      and(
        eq(rssTranslate.id, job.data.rssTranslate?.rssTranslate.id ?? ""),
        eq(rssTranslate.jobId, job.id ?? ""),
      ),
    );
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
  if (job) {
    db.update(rssTranslate)
      .set({
        jobStatus: "failed",
      })
      .where(
        and(
          eq(rssTranslate.id, job.data.rssTranslate?.rssTranslate.id ?? ""),
          eq(rssTranslate.jobId, job.id ?? ""),
        ),
      );
  }
});
