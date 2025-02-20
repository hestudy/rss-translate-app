import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { translatePrompt } from "~/server/db/schema";
import { authProcedure, createTRPCRouter } from "../trpc";

export const translatePromptRouter = createTRPCRouter({
  create: authProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        prompt: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await db.insert(translatePrompt).values({
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
      return await db.query.translatePrompt.findFirst({
        where: eq(translatePrompt.id, input.id),
      });
    }),
  update: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
        name: z.string().nonempty(),
        prompt: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...props } = input;
      return await db
        .update(translatePrompt)
        .set({
          ...props,
        })
        .where(eq(translatePrompt.id, id));
    }),
  delete: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .delete(translatePrompt)
        .where(eq(translatePrompt.id, input.id));
    }),
  list: authProcedure.query(async () => {
    return await db.query.translatePrompt.findMany();
  }),
});
