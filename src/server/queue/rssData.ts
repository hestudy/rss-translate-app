import { Queue, Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { type User } from "next-auth";
import Parser from "rss-parser";
import { env } from "~/env";
import { db } from "../db";
import { translateData, rssOrigin } from "../db/schema";

const parser = new Parser();

export const rssDataQueue = new Queue("rssData", {
  connection: {
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: 1000 * 60 * 5,
  },
});

const worker = new Worker<{
  origin: typeof rssOrigin.$inferSelect;
  user: User;
}>(
  "rssData",
  async (job) => {
    const feed = await parser.parseURL(job.data.origin.link);
    await db.insert(translateData).values({
      data: feed,
      rssOriginId: job.data.origin.id,
      createdById: job.data.user.id!,
      jobId: job.id,
    });
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);

worker.on("progress", (job) => {
  console.log(`${job.id} has progress ${job.progress.toString()}`);
  db.update(rssOrigin)
    .set({
      jobStatus: "progress",
    })
    .where(
      and(
        eq(rssOrigin.id, job.data.origin.id),
        eq(rssOrigin.jobId, job.id ?? ""),
      ),
    );
});

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
  db.update(rssOrigin)
    .set({
      jobStatus: "completed",
    })
    .where(
      and(
        eq(rssOrigin.id, job.data.origin.id),
        eq(rssOrigin.jobId, job.id ?? ""),
      ),
    );
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
  if (job) {
    db.update(rssOrigin)
      .set({
        jobStatus: "failed",
      })
      .where(
        and(
          eq(rssOrigin.id, job.data.origin.id),
          eq(rssOrigin.jobId, job.id ?? ""),
        ),
      );
  }
});
