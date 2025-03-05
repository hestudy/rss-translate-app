import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import {
  rssOrigin,
  rssTranslate,
  rssTranslateData,
  translateOrigin,
  translatePrompt,
} from "~/server/db/schema";
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

export const rssTranslateRouter = createTRPCRouter({
  create: authProcedure
    .input(createRssTranslateSchema)
    .mutation(async ({ input, ctx }) => {
      return await db.insert(rssTranslate).values({
        ...input,
        createdById: ctx.session.user.id,
      });
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
    .mutation(async ({ input, ctx }) => {
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
  detail: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await getRssTranslateDetail(input.id);
    }),
  clear: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .delete(rssTranslateData)
        .where(eq(rssTranslateData.rssTranslateId, input.id));
    }),
});
