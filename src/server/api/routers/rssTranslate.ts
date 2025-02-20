import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import {
  rssOrigin,
  rssTranslate,
  translateOrigin,
  translatePrompt,
} from "~/server/db/schema";
import { authProcedure, createTRPCRouter } from "../trpc";

export const rssTranslateRouter = createTRPCRouter({
  create: authProcedure
    .input(
      z.object({
        rssOrigin: z.string().nonempty(),
        translateOrigin: z.string().nonempty(),
        translatePrompt: z.string().nonempty(),
      }),
    )
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
    .input(
      z.object({
        rssOrigin: z.string().nonempty(),
        translateOrigin: z.string().nonempty(),
        translatePrompt: z.string().nonempty(),
        id: z.string().nonempty(),
      }),
    )
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
});
