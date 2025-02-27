import { count, eq } from "drizzle-orm";
import { User } from "next-auth";
import { z } from "zod";
import { db } from "~/server/db";
import {
  rssOrigin,
  rssTranslate,
  translateOrigin,
  translatePrompt,
} from "~/server/db/schema";
import { rssTranslateDataQueue } from "~/server/queue/rssTranslateData";
import {
  createRssTranslateSchema,
  updateRssTranslateSchema,
} from "../schema/rssTranslate";
import { authProcedure, createTRPCRouter } from "../trpc";

const getRssTranslateDetail = async (id: string) => {
  return (
    await db
      .select()
      .from(rssTranslate)
      .where(eq(rssTranslate.id, id))
      .leftJoin(rssOrigin, eq(rssTranslate.rssOrigin, rssOrigin.id))
      .leftJoin(
        translateOrigin,
        eq(rssTranslate.translateOrigin, translateOrigin.id),
      )
      .leftJoin(
        translatePrompt,
        eq(rssTranslate.translatePrompt, translatePrompt.id),
      )
  ).at(0);
};

const addRssTranslateQueue = async (id: string, user: User) => {
  const detail = await getRssTranslateDetail(id);
  if (detail?.rssTranslate.enabled && detail.rssTranslate.cron) {
    const job = await rssTranslateDataQueue.add(
      "rssTranslateData",
      {
        rssTranslate: detail,
        user,
      },
      {
        repeat: {
          pattern: detail?.rssTranslate.cron,
        },
      },
    );
    await db
      .update(rssTranslate)
      .set({ jobId: job.id })
      .where(eq(rssTranslate.id, id));
  }
};

export const rssTranslateRouter = createTRPCRouter({
  create: authProcedure
    .input(createRssTranslateSchema)
    .mutation(async ({ input, ctx }) => {
      const result = (
        await db
          .insert(rssTranslate)
          .values({
            ...input,
            createdById: ctx.session.user.id,
          })
          .returning()
      ).at(0);
      if (result) {
        await addRssTranslateQueue(result.id, ctx.session.user);
      }
    }),
  disabled: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      const record = await db.query.rssTranslate.findFirst({
        where: eq(rssTranslate.id, input.id),
      });
      if (record?.jobId) {
        await rssTranslateDataQueue.remove(record.jobId);
      }
    }),
  enabled: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await addRssTranslateQueue(input.id, ctx.session.user);
    }),
  info: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await db.query.rssTranslate.findFirst({
        where: eq(rssTranslate.id, input.id),
      });
    }),
  update: authProcedure
    .input(updateRssTranslateSchema)
    .mutation(async ({ input }) => {
      const { id, ...props } = input;
      return await db
        .update(rssTranslate)
        .set(props)
        .where(eq(rssTranslate.id, id));
    }),
  delete: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.delete(rssTranslate).where(eq(rssTranslate.id, input.id));
    }),
  page: authProcedure
    .input(
      z.object({
        current: z.number(),
        pageSize: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const list = await db
        .select()
        .from(rssTranslate)
        .offset((input.current - 1) * input.pageSize)
        .limit(input.pageSize)
        .leftJoin(rssOrigin, eq(rssTranslate.rssOrigin, rssOrigin.id))
        .leftJoin(
          translateOrigin,
          eq(rssTranslate.translateOrigin, translateOrigin.id),
        )
        .leftJoin(
          translatePrompt,
          eq(rssTranslate.translatePrompt, translatePrompt.id),
        );
      const [result] = await db.select({ count: count() }).from(rssTranslate);
      return {
        list,
        total: result?.count ?? 0,
      };
    }),
  run: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = (
        await db
          .select()
          .from(rssTranslate)
          .where(eq(rssTranslate.id, input.id))
          .leftJoin(rssOrigin, eq(rssTranslate.rssOrigin, rssOrigin.id))
          .leftJoin(
            translateOrigin,
            eq(rssTranslate.translateOrigin, translateOrigin.id),
          )
          .leftJoin(
            translatePrompt,
            eq(rssTranslate.translatePrompt, translatePrompt.id),
          )
      ).at(0);
      if (result) {
        const job = await rssTranslateDataQueue.add("rssTranslate", {
          rssTranslate: result,
          user: ctx.session.user,
        });
        await db
          .update(rssTranslate)
          .set({
            jobId: job.id,
          })
          .where(eq(rssTranslate.id, input.id));
      }
    }),
  detail: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await getRssTranslateDetail(input.id);
    }),
});
