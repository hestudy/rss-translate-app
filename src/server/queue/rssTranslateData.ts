import { Queue, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { type User } from "next-auth";
import { env } from "~/env";
import { type api } from "~/trpc/server";
import { fetchFeed } from "~/utils/fetchFeed";
import { db } from "../db";
import { rssTranslateData, rssTranslateDataItem } from "../db/schema";
import { rssTranslateDataItemQueue } from "./rssTranslateDataItem";

export const rssTranslateDataQueue = new Queue("rssTranslateData", {
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
  "rssTranslateData",
  async (job) => {
    const feed = await fetchFeed(job.data.rssTranslate?.rssOrigin?.link ?? "");

    if (!feed) {
      throw new Error("Failed to fetch feed");
    }

    const existQueueList = await db
      .select()
      .from(rssTranslateData)
      .where(
        eq(
          rssTranslateData.rssTranslateId,
          job.data.rssTranslate?.rssTranslate.id ?? "",
        ),
      )
      .leftJoin(
        rssTranslateDataItem,
        eq(rssTranslateDataItem.rssTranslateDataId, rssTranslateData.id),
      );

    const existQueueStateList = await Promise.all(
      existQueueList.map(
        async (item) =>
          await rssTranslateDataItemQueue.getJobState(
            item.rssTranslateDataItem?.jobId ?? "",
          ),
      ),
    );

    const hasWaitQueue = existQueueStateList.some(
      (d) => d === "waiting" || d === "active",
    );

    if (hasWaitQueue) {
      console.log("has wait queue, skip");
      return;
    }

    const result = (
      await db
        .insert(rssTranslateData)
        .values({
          rssTranslateId: job.data.rssTranslate?.rssTranslate.id ?? "",
          jobId: job.id,
          feed,
          createdById: job.data.user.id!,
        })
        .returning()
    ).at(0);
    if (result) {
      for (const item of feed.items) {
        const itemResult = (
          await db
            .insert(rssTranslateDataItem)
            .values({
              createdById: job.data.user.id!,
              rssTranslateDataId: result.id,
              link: item.link ?? "",
              origin: item,
            })
            .returning()
        ).at(0);
        if (itemResult) {
          const itemJob = await rssTranslateDataItemQueue.add(
            "rssTranslateDataItem",
            {
              rssTranslateDataItem: itemResult,
              rssTranslate: job.data.rssTranslate,
              item,
              user: job.data.user,
            },
          );
          await db
            .update(rssTranslateDataItem)
            .set({
              jobId: itemJob.id,
            })
            .where(eq(rssTranslateDataItem.id, itemResult.id));
        }
      }
    }
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
