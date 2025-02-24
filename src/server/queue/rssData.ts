import { Queue, Worker } from "bullmq";
import { and, eq } from "drizzle-orm";
import { User } from "next-auth";
import Parser from "rss-parser";
import { env } from "~/env";
import { db } from "../db";
import { rssData, rssOrigin } from "../db/schema";

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
    await db.insert(rssData).values({
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

worker.on("progress", async (job) => {
  console.log(`${job.id} has progress ${job.progress}`);
  await db
    .update(rssOrigin)
    .set({
      jobStatus: "progress",
    })
    .where(
      and(
        eq(rssOrigin.id, job.data.origin.id),
        eq(rssOrigin.jobId, job.id || ""),
      ),
    );
});

worker.on("completed", async (job) => {
  console.log(`${job.id} has completed!`);
  await db
    .update(rssOrigin)
    .set({
      jobStatus: "completed",
    })
    .where(
      and(
        eq(rssOrigin.id, job.data.origin.id),
        eq(rssOrigin.jobId, job.id || ""),
      ),
    );
});

worker.on("failed", async (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
  if (job) {
    await db
      .update(rssOrigin)
      .set({
        jobStatus: "failed",
      })
      .where(
        and(
          eq(rssOrigin.id, job.data.origin.id),
          eq(rssOrigin.jobId, job.id || ""),
        ),
      );
  }
});
